<?php

namespace App\Helpers;

/**
 * Minimal KHQR (Bakong) payload generator — EMVCo TLV + CRC16-CCITT.
 *
 * Produces a valid KHQR string a Bakong-connected app can scan and pay, plus the
 * md5 of that exact string. NBC Bakong keys each transaction by the md5 of the
 * scanned QR, so md5(qr) is what we later pass to check_transaction_by_md5.
 * Field ordering follows the EMVCo/KHQR spec; only validity + a correct CRC matter
 * (the md5 is of our own generated string, not a canonical re-encoding).
 */
class Khqr
{
    /**
     * @param array{account_id:string,merchant_name?:string,city?:string,amount?:float|int|null,currency?:string,bill_number?:string} $p
     * @return array{qr:string,md5:string}
     */
    public static function generate(array $p): array
    {
        $accountId = trim($p['account_id'] ?? '');
        $merchant  = mb_substr($p['merchant_name'] ?? 'Merchant', 0, 25);
        $city      = mb_substr($p['city'] ?? 'Phnom Penh', 0, 15);
        $amount    = $p['amount'] ?? null;
        $currency  = (($p['currency'] ?? 'USD') === 'KHR') ? '116' : '840';
        $bill      = $p['bill_number'] ?? null;

        // Tag 29 — merchant account information (individual); sub-tag 00 = Bakong account id.
        $merchantAccount = self::tlv('00', $accountId);

        $tags   = [];
        $tags[] = self::tlv('00', '01');                                  // payload format indicator
        $tags[] = self::tlv('01', $amount !== null ? '12' : '11');        // 12 = dynamic (one-time), 11 = static
        $tags[] = self::tlv('29', $merchantAccount);                      // merchant account info
        $tags[] = self::tlv('53', $currency);                             // transaction currency
        if ($amount !== null) {
            $tags[] = self::tlv('54', self::amount($amount, $currency));  // transaction amount
        }
        $tags[] = self::tlv('58', 'KH');                                  // country code
        $tags[] = self::tlv('59', $merchant);                            // merchant name
        $tags[] = self::tlv('60', $city);                                // merchant city
        if ($bill) {
            $tags[] = self::tlv('62', self::tlv('01', mb_substr((string) $bill, 0, 25))); // additional data: bill number
        }

        // CRC is computed over the whole payload including the CRC tag id + length ("6304").
        $payload = implode('', $tags) . '6304';
        $qr      = $payload . self::crc16($payload);

        return ['qr' => $qr, 'md5' => md5($qr)];
    }

    private static function tlv(string $id, string $value): string
    {
        return $id . str_pad((string) strlen($value), 2, '0', STR_PAD_LEFT) . $value;
    }

    private static function amount($amount, string $currencyCode): string
    {
        // KHR (116) has no minor unit; USD (840) uses 2 decimals.
        if ($currencyCode === '116') {
            return (string) (int) round((float) $amount);
        }
        return number_format((float) $amount, 2, '.', '');
    }

    // CRC16-CCITT (FALSE): poly 0x1021, init 0xFFFF, no reflection — the EMVCo/KHQR standard.
    private static function crc16(string $data): string
    {
        $crc = 0xFFFF;
        $len = strlen($data);
        for ($i = 0; $i < $len; $i++) {
            $crc ^= (ord($data[$i]) << 8);
            for ($j = 0; $j < 8; $j++) {
                $crc = ($crc & 0x8000) ? (($crc << 1) ^ 0x1021) : ($crc << 1);
                $crc &= 0xFFFF;
            }
        }
        return strtoupper(str_pad(dechex($crc), 4, '0', STR_PAD_LEFT));
    }
}
