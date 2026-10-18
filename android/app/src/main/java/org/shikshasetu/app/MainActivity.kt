package org.shikshasetu.app

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import org.shikshasetu.app.data.local.AppDatabase
import org.shikshasetu.app.ui.screens.StudentAppMain
import org.shikshasetu.app.ui.theme.ShikshaSetuTheme

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        val database = AppDatabase.getDatabase(applicationContext)

        setContent {
            ShikshaSetuTheme {
                StudentAppMain(database = database)
            }
        }
    }
}
