import * as Haptics from "expo-haptics";

export type HapticKind = "success" | "warning" | "error";

export async function safeNotify(kind: HapticKind) {
  try {
    const map: Record<HapticKind, Haptics.NotificationFeedbackType> = {
      success: Haptics.NotificationFeedbackType.Success,
      warning: Haptics.NotificationFeedbackType.Warning,
      error: Haptics.NotificationFeedbackType.Error
    };
    await Haptics.notificationAsync(map[kind]);
  } catch (_) {
    // no-op if haptics module is missing or not available
  }
}
