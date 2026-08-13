<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ApplicationAnswer extends Model
{
    protected $table = 'application_answers';

    protected $fillable = ['application_id', 'question_id', 'answer_text', 'passed'];

    protected $casts = [
        'passed' => 'boolean',
    ];

    public function question()
    {
        return $this->belongsTo(JobScreeningQuestion::class, 'question_id');
    }
}
