import PushNotification from 'react-native-push-notification';
import { Notification, NotificationType } from '../types';

class NotificationService {
  constructor() {
    this.configurePushNotifications();
  }

  private configurePushNotifications(): void {
    PushNotification.configure({
      onRegister: function (token: string) {
        console.log('TOKEN:', token);
      },

      onNotification: function (notification: any) {
        console.log('NOTIFICATION:', notification);
      },

      permissions: {
        alert: true,
        badge: true,
        sound: true,
      },

      popInitialNotification: true,
      requestPermissions: true,
    });

    PushNotification.createChannel(
      {
        channelId: 'jee-productivity',
        channelName: 'JEE Productivity App',
        channelDescription: 'Notifications for JEE Productivity App',
        playSound: true,
        soundName: 'default',
        importance: 4,
        vibrate: true,
      },
      (created: boolean) => console.log(`Channel created: ${created}`)
    );
  }

  scheduleNotification(notification: Notification): void {
    const scheduledDate = new Date(notification.scheduledFor);
    const now = new Date();

    if (scheduledDate <= now) {
      // If the scheduled time has passed, send immediately
      this.sendImmediateNotification(notification);
      return;
    }

    PushNotification.localNotificationSchedule({
      channelId: 'jee-productivity',
      id: notification.id,
      title: notification.title,
      message: notification.message,
      date: scheduledDate,
      allowWhileIdle: true,
      repeatType: 'day',
      userInfo: {
        id: notification.id,
        type: notification.type,
        actionData: notification.actionData,
      },
    });
  }

  sendImmediateNotification(notification: Notification): void {
    PushNotification.localNotification({
      channelId: 'jee-productivity',
      id: notification.id,
      title: notification.title,
      message: notification.message,
      userInfo: {
        id: notification.id,
        type: notification.type,
        actionData: notification.actionData,
      },
    });
  }

  cancelNotification(notificationId: string): void {
    PushNotification.cancelLocalNotification({ id: notificationId });
  }

  cancelAllNotifications(): void {
    PushNotification.cancelAllLocalNotifications();
  }

  // Study session reminder
  scheduleStudyReminder(subject: string, time: string): void {
    const notification: Notification = {
      id: `study-reminder-${Date.now()}`,
      title: 'Study Time! 📚',
      message: `Time to study ${subject}. Stay focused and consistent!`,
      type: 'reminder',
      scheduledFor: time,
      isRead: false,
      actionData: { subject, type: 'study-reminder' },
    };

    this.scheduleNotification(notification);
  }

  // Streak update notification
  sendStreakNotification(currentStreak: number, longestStreak: number): void {
    const notification: Notification = {
      id: `streak-${Date.now()}`,
      title: '🔥 Streak Update!',
      message: `Great job! You're on a ${currentStreak} day streak. Your longest streak is ${longestStreak} days.`,
      type: 'streak',
      scheduledFor: new Date().toISOString(),
      isRead: false,
      actionData: { currentStreak, longestStreak },
    };

    this.sendImmediateNotification(notification);
  }

  // Exam countdown notification
  scheduleExamCountdown(examType: string, daysLeft: number, examDate: string): void {
    let title = '';
    let message = '';

    if (daysLeft === 7) {
      title = '⚠️ One Week to Go!';
      message = `${examType} is in 7 days. Time to intensify your preparation!`;
    } else if (daysLeft === 1) {
      title = '🚨 Exam Tomorrow!';
      message = `${examType} is tomorrow. Get a good night's sleep and stay confident!`;
    } else if (daysLeft === 0) {
      title = '🎯 Exam Day!';
      message = `Good luck with your ${examType} exam today! You've got this!`;
    }

    if (title && message) {
      const notification: Notification = {
        id: `exam-countdown-${examType}-${daysLeft}`,
        title,
        message,
        type: 'exam',
        scheduledFor: examDate,
        isRead: false,
        actionData: { examType, daysLeft },
      };

      this.scheduleNotification(notification);
    }
  }

  // Pomodoro break reminder
  schedulePomodoroBreak(breakDuration: number): void {
    const breakEndTime = new Date(Date.now() + breakDuration * 60 * 1000);
    
    const notification: Notification = {
      id: `pomodoro-break-${Date.now()}`,
      title: '⏰ Break Time!',
      message: `Take a ${breakDuration} minute break. Stretch, hydrate, and relax.`,
      type: 'reminder',
      scheduledFor: breakEndTime.toISOString(),
      isRead: false,
      actionData: { type: 'pomodoro-break', duration: breakDuration },
    };

    this.scheduleNotification(notification);
  }

  // Task deadline reminder
  scheduleTaskDeadline(taskTitle: string, deadline: string, priority: string): void {
    const deadlineDate = new Date(deadline);
    const now = new Date();
    const hoursLeft = Math.floor((deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60));

    let title = '';
    let message = '';

    if (hoursLeft <= 1) {
      title = '🚨 Urgent Deadline!';
      message = `"${taskTitle}" is due in less than an hour!`;
    } else if (hoursLeft <= 24) {
      title = '⚠️ Deadline Approaching!';
      message = `"${taskTitle}" is due in ${hoursLeft} hours.`;
    } else if (hoursLeft <= 72) {
      title = '📅 Deadline Soon!';
      message = `"${taskTitle}" is due in ${Math.floor(hoursLeft / 24)} days.`;
    }

    if (title && message) {
      const notification: Notification = {
        id: `task-deadline-${Date.now()}`,
        title,
        message,
        type: 'reminder',
        scheduledFor: deadline,
        isRead: false,
        actionData: { taskTitle, priority, type: 'task-deadline' },
      };

      this.scheduleNotification(notification);
    }
  }

  // Achievement notification
  sendAchievementNotification(achievement: string, description: string): void {
    const notification: Notification = {
      id: `achievement-${Date.now()}`,
      title: `🏆 ${achievement}`,
      message: description,
      type: 'achievement',
      scheduledFor: new Date().toISOString(),
      isRead: false,
      actionData: { achievement, type: 'achievement' },
    };

    this.sendImmediateNotification(notification);
  }

  // Daily motivation notification
  scheduleDailyMotivation(): void {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(8, 0, 0, 0); // 8 AM tomorrow

    const motivationalMessages = [
      'Every day of studying brings you closer to your JEE dream! 📚✨',
      'Consistency is the key to success. Keep going! 💪',
      'Your future self will thank you for today\'s hard work! 🌟',
      'Small progress every day leads to big results! 📈',
      'Believe in yourself and your abilities! 🚀',
    ];

    const randomMessage = motivationalMessages[Math.floor(Math.random() * motivationalMessages.length)];

    const notification: Notification = {
      id: `daily-motivation-${tomorrow.toDateString()}`,
      title: '🌅 Good Morning, JEE Aspirant!',
      message: randomMessage,
      type: 'reminder',
      scheduledFor: tomorrow.toISOString(),
      isRead: false,
      actionData: { type: 'daily-motivation' },
    };

    this.scheduleNotification(notification);
  }
}

export const notificationService = new NotificationService();
