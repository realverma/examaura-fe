import { createBrowserRouter } from 'react-router';
import { Navbar } from './components/Navbar';
import { Toaster } from './components/ui/sonner';
import { Footer } from './components/Footer';
import { OAuth2RedirectHandler } from './auth/OAuth2RedirectHandler';
import ProtectedRoute from './routes/ProtectedRoute';
import PublicOnlyRoute from './routes/PublicOnlyRoute';
import React from 'react';

function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      {children}
      <Footer />
      <Toaster />
    </div>
  );
}

export const router = createBrowserRouter([
  // ==========================================
  // PUBLIC ROUTES
  // ==========================================
  {
    path: '/',
    lazy: async () => {
      const { Dashboard } = await import('./pages/Dashboard');

      return {
        Component: () => (
          <RootLayout>
            <Dashboard />
          </RootLayout>
        ),
      };
    },
  },
  {
    path: '/quizzes',
    lazy: async () => {
      const { AllQuizzes } = await import('./pages/AllQuizzes');

      return {
        Component: () => (
          <RootLayout>
            <AllQuizzes />
          </RootLayout>
        ),
      };
    },
  },
  {
    path: '/quiz/:quizId/instructions',
    lazy: async () => {
      const { QuizInstructions } = await import('./pages/QuizInstructions');

      return {
        Component: () => (
          <RootLayout>
            <QuizInstructions />
          </RootLayout>
        ),
      };
    },
  },
  {
    path: '/category/:categoryId',
    lazy: async () => {
      const { CategoryPage } = await import('./pages/CategoryPage');

      return {
        Component: () => (
          <RootLayout>
            <CategoryPage />
          </RootLayout>
        ),
      };
    },
  },

  // ==========================================
  // PUBLIC-ONLY ROUTES
  // ==========================================
  {
    element: <PublicOnlyRoute />,
    children: [
      {
        path: '/login',
        lazy: async () => {
          const { default: LoginPage } = await import('./pages/LoginPage');

          return {
            Component: LoginPage,
          };
        },
      },
    ],
  },

  // ==========================================
  // OAUTH ROUTES
  // ==========================================
  {
    path: '/oauth2/redirect',
    lazy: async () => {
      const { OAuth2RedirectHandler } = await import(
        './auth/OAuth2RedirectHandler'
      );

      return {
        Component: () => (
          <RootLayout>
            <OAuth2RedirectHandler />
          </RootLayout>
        ),
      };
    },
  },

  // ==========================================
  // PROTECTED ROUTES
  // ==========================================
  {
    element: <ProtectedRoute />,
    children: [
      {
        path: '/create-quiz',
        lazy: async () => {
          const { QuizCreator } = await import('./pages/QuizCreator');

          return {
            Component: () => (
              <RootLayout>
                <QuizCreator />
              </RootLayout>
            ),
          };
        },
      },
      {
        path: '/profile',
        lazy: async () => {
          const { Profile } = await import('./pages/Profile');

          return {
            Component: () => (
              <RootLayout>
                <Profile />
              </RootLayout>
            ),
          };
        },
      },
      {
        path: '/quiz/:quizId/attempt',
        lazy: async () => {
          const { ActiveQuiz } = await import('./pages/ActiveQuiz');

          return {
            Component: ActiveQuiz,
          };
        },
      },
      {
        path: '/quiz/:quizId/results',
        lazy: async () => {
          const { QuizResults } = await import('./pages/QuizResults');

          return {
            Component: () => (
              <RootLayout>
                <QuizResults />
              </RootLayout>
            ),
          };
        },
      },
    ],
  },
]);