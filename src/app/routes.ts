import { createBrowserRouter } from 'react-router';
import LoginForm from './components/LoginForm';
import TeamSelection from './components/TeamSelection';
import GuideSelection from './components/GuideSelection';
import ConfirmationPage from './components/ConfirmationPage';
import ApplicationLetter from './components/ApplicationLetter';
import ErrorBoundary from './components/ErrorBoundary';

export const router = createBrowserRouter([
  {
    path: '/',
    Component: LoginForm,
    ErrorBoundary: ErrorBoundary,
  },
  {
    path: '/team',
    Component: TeamSelection,
    ErrorBoundary: ErrorBoundary,
  },
  {
    path: '/guide',
    Component: GuideSelection,
    ErrorBoundary: ErrorBoundary,
  },
  {
    path: '/confirm',
    Component: ConfirmationPage,
    ErrorBoundary: ErrorBoundary,
  },
  {
    path: '/application',
    Component: ApplicationLetter,
    ErrorBoundary: ErrorBoundary,
  },
]);
