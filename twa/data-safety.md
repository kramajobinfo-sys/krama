# Krama — Google Play Data safety answers

Fill this in Play Console → **Policy → App content → Data safety**. It's a legal
declaration — verify each ⚠️ against how Krama actually behaves before submitting.
Definitions Google uses: **Collected** = sent off the device; **Shared** = transferred
to another company/third party (for a job board, the hiring **employer** is a third party,
so applicant data the employer receives counts as "shared").

## Section 1 — Overview
- **Does your app collect or share any of the required user data types?** → **Yes**
- **Is all of the user data collected by your app encrypted in transit?** → **Yes** (HTTPS/TLS everywhere; site is behind Cloudflare)
- **Do you provide a way for users to request that their data be deleted?** → **Yes — needs a URL** ⚠️ (see "Action items"). Choose "**Users can request data deletion**" and, if account self-deletion isn't in the app yet, give the deletion-request URL.

## Section 2 — Data types (declare each as below)

### Personal info
| Data type | Collected | Shared | Required/Optional | Purposes |
|---|---|---|---|---|
| **Name** | Yes | **Yes** (employers see it on your application) | Required | App functionality, Account management |
| **Email address** | Yes | ⚠️ Confirm (Yes if employers see applicant email) | Required | App functionality, Account management |
| **Phone number** | Yes | ⚠️ Confirm (Yes if employers see applicant phone) | Optional | App functionality, Account management |
| **User IDs** | Yes | No | Required | App functionality, Account management |
| **Address** | No | — | — | — (only a province/city preference is stored, not a home address) |

### Financial info
| Data type | Collected | Shared | Required/Optional | Purposes |
|---|---|---|---|---|
| **Purchase history** | Yes (employers who buy plans/featured) | No | Optional | App functionality |
| **Payment info** | **No** ⚠️ | — | — | Card/bank details are handled by the payment processors (Stripe / ABA / Bakong KHQR); Krama doesn't store card numbers. Declare **No** only if that's true of your setup. |

### Messages
| Data type | Collected | Shared | Required/Optional | Purposes |
|---|---|---|---|---|
| **Other in-app messages** | Yes (candidate ↔ employer chat) | No (delivered to the conversation's other party only) | Optional | App functionality |

### Photos and videos
| Data type | Collected | Shared | Required/Optional | Purposes |
|---|---|---|---|---|
| **Photos** | Yes (profile photo / logo) | Yes (shown on your public profile / to employers) | Optional | App functionality |

### Files and docs
| Data type | Collected | Shared | Required/Optional | Purposes |
|---|---|---|---|---|
| **Files and docs** | Yes (uploaded CV / résumé) | Yes (employers receive it when you apply) | Optional | App functionality |

### App activity
| Data type | Collected | Shared | Required/Optional | Purposes |
|---|---|---|---|---|
| **App interactions** (saved jobs, applications, searches) | Yes | No | Optional | App functionality, Analytics |
| **Other user-generated content** (forum posts, company reviews, cover notes) | Yes | Yes (forum posts/reviews are public) | Optional | App functionality |

### Location → **No**
The app does not request device GPS. A user-chosen province is a preference, not device location.

### Device or other IDs → **No** ⚠️
Only if the site embeds **no** analytics/ads SDK (e.g. no Google Analytics/Firebase in the web app). The TWA itself adds none. **Confirm the website has no analytics SDK** — if it does (e.g. GA), declare "Device or other IDs" + "App activity" as Collected for **Analytics**.

### Not collected (leave unchecked)
Health & fitness, Contacts, Calendar, Audio, Music, Web browsing history, Installed apps, Precise/approximate location, Race/ethnicity, Political/religious beliefs, Sexual orientation, Sensitive info.

## Section 3 — Purposes cheat-sheet
- **Account management** → Name, Email, Phone, User IDs
- **App functionality** → everything above (login, apply, alerts, messaging, résumé, billing)
- **Analytics** → only App interactions (and only if you actually analyze usage)
- **Advertising or marketing** → **None** (job alerts are functional notifications, not marketing — keep this unchecked unless you send promotional emails)
- **Personalization** → optional for AI job matching (App functionality also fine)
- **Fraud prevention / security** → optional for User IDs

## Action items before you submit
1. ⚠️ **Data deletion path (required by Play).** Either add in-app "Delete my account," or publish a deletion-request page/URL and enter it. I can build a simple `/account/delete` request route + a section on the privacy page — just say the word.
2. ⚠️ Confirm whether **employers see an applicant's email/phone** (drives the "Shared" flags for those two).
3. ⚠️ Confirm the **website has no analytics/ads SDK** (keeps "Device or other IDs" = No).
4. ⚠️ Confirm **card data is never stored** by Krama (only by Stripe/ABA/Bakong) → keeps "Payment info" = No.
5. Make sure the **privacy policy** (https://kramajob.com/privacy) describes this collection/sharing and the deletion method — Play cross-checks it.
