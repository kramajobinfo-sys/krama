<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class InterviewScorecard extends Model
{
    protected $table = 'interview_scorecards';

    protected $fillable = ['interview_id', 'company_id', 'author_id', 'ratings', 'recommendation', 'comment'];

    protected $casts = [
        'ratings' => 'array',
    ];

    public function interview()
    {
        return $this->belongsTo(Interview::class);
    }

    public function author()
    {
        return $this->belongsTo(User::class, 'author_id');
    }
}
