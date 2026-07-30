export type Lesson = {
  id: string;
  title: string;
  type: 'video' | 'pdf' | 'theory' | 'quiz';
  videoUrl?: string;
  content?: string;
  resources?: string[];
  duration?: number; // minutes
};

export type Module = {
  id: string;
  title: string;
  lessons: Lesson[];
};

export type Course = {
  id?: string;
  slug: string;
  title: string;
  description: string;
  shortDescription?: string;
  price: number;
  currency?: string;
  instructor?: { id: string; name: string; bio?: string; avatarUrl?: string };
  duration?: string;
  rating?: number;
  studentsCount?: number;
  imageUrl?: string;
  modules?: Module[];
  isPublished?: boolean;
  createdAt?: any;
  updatedAt?: any;
};

export type User = {
  uid: string;
  studentId?: string;
  name?: string;
  email?: string;
  role?: 'admin' | 'student';
  enrolledCourses?: { courseId: string; purchasedAt?: any; progress?: number }[];
};
