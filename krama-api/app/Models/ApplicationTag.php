<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ApplicationTag extends Model
{
    protected $table = 'application_tags';

    protected $fillable = ['application_id', 'company_id', 'label'];

    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function application()
    {
        return $this->belongsTo(Application::class);
    }
}
