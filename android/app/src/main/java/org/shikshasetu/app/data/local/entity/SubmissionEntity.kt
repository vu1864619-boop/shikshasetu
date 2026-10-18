package org.shikshasetu.app.data.local.entity

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "offline_submissions")
data class SubmissionEntity(
    @PrimaryKey
    val clientIdempotencyKey: String,
    val projectId: String,
    val activityId: String,
    val dayNumber: Int,
    val studentId: String,
    val classId: String,
    val answersJson: String,
    val clientTimestamp: String,
    val syncStatus: String = "PENDING", // PENDING or SYNCED
    val serverSubmissionId: String? = null
)
