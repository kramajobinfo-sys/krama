<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class EmailList extends Model
{
    public $timestamps = false;
    protected $fillable = ['name', 'recipient_count', 'created_by', 'created_at'];

    public function recipients()
    {
        return $this->hasMany(EmailListRecipient::class, 'list_id');
    }
}
