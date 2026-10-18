package org.shikshasetu.app.data.local.dao

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import kotlinx.coroutines.flow.Flow
import org.shikshasetu.app.data.local.entity.SubmissionEntity

@Dao
interface SubmissionDao {
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertSubmission(submission: SubmissionEntity)

    @Query("SELECT * FROM offline_submissions WHERE syncStatus = 'PENDING'")
    suspend fun getPendingSubmissions(): List<SubmissionEntity>

    @Query("SELECT COUNT(*) FROM offline_submissions WHERE syncStatus = 'PENDING'")
    fun observePendingCount(): Flow<Int>

    @Query("SELECT * FROM offline_submissions ORDER BY clientTimestamp DESC")
    fun observeAllSubmissions(): Flow<List<SubmissionEntity>>

    @Query("UPDATE offline_submissions SET syncStatus = 'SYNCED', serverSubmissionId = :serverId WHERE clientIdempotencyKey = :key")
    suspend fun markSynced(key: String, serverId: String)

    @Query("DELETE FROM offline_submissions WHERE syncStatus = 'SYNCED'")
    suspend fun clearSyncedData()
}
