<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SavedCandidate extends Model
{
    protected $table = 'saved_candidates';

    protected $fillable = ['company_id', 'candidate_id', 'saved_by', 'note'];

    public function candidate()
    {
        return $this->belongsTo(User::class, 'candidate_id');
    }
}
