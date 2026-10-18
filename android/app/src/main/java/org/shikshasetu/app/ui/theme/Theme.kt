package org.shikshasetu.app.ui.theme

import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color

val BrandGreen = Color(0xFF15803D)
val BrandLightGreen = Color(0xFFDCFCE7)
val SaffronOrange = Color(0xFFEA580C)
val BackgroundOffWhite = Color(0xFFF8FAFC)
val SurfaceWhite = Color(0xFFFFFFFF)
val TextDark = Color(0xFF0F172A)
val TextMuted = Color(0xFF64748B)

private val LightColorScheme = lightColorScheme(
    primary = BrandGreen,
    secondary = SaffronOrange,
    background = BackgroundOffWhite,
    surface = SurfaceWhite,
    onPrimary = Color.White,
    onSecondary = Color.White,
    onBackground = TextDark,
    onSurface = TextDark
)

@Composable
fun ShikshaSetuTheme(content: @Composable () -> Unit) {
    MaterialTheme(
        colorScheme = LightColorScheme,
        content = content
    )
}
