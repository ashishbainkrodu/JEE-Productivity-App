import { Notification, NotificationType } from '../types';

class WebNotificationService {
  constructor() {
    this.requestPermission();
  }

  private async requestPermission(): Promise<void> {
    if ('Notification' in window && Notification.permission === 'default') {
      await Notification.requestPermission();
    }
  }

  private canShowNotification(): boolean {
    return 'Notification' in window && Notification.permission === 'granted';
  }

  private showBrowserNotification(title: string, message: string): void {
    if (this.canShowNotification()) {
      new Notification(title, {
        body: message,
        icon: '/favicon.ico',
        badge: '/favicon.ico'
      });
    }
  }

  scheduleNotification(notification: Notification): void {
    const scheduledDate = new Date(notification.scheduledFor);
    const now = new Date();

    if (scheduledDate <= now) {
      // If the scheduled time has passed, send immediately
      this.sendImmediateNotification(notification);
      return;
    }

    // Schedule for later using setTimeout
    const delay = scheduledDate.getTime() - now.getTime();
    setTimeout(() => {
      this.showBrowserNotification(notification.title, notification.message);
    }, delay);
  }

  sendImmediateNotification(notification: Notification): void {
    this.showBrowserNotification(notification.title, notification.message);
  }

  cancelNotification(notificationId: string): void {
    // Browser notifications can't be cancelled, but we can track them
    console.log(`Notification ${notificationId} cancelled`);
  }

  cancelAllNotifications(): void {
    // Browser notifications can't be cancelled, but we can track them
    console.log('All notifications cancelled');
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

export const webNotificationService = new WebNotificationService();
