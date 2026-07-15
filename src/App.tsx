import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { Layout } from './components/Layout';
import { ProtectedRoute } from './components/ProtectedRoute';
import { useAuthStore } from './store/auth';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { AllIdeas } from './pages/AllIdeas';
import { ValidationQueue } from './pages/ValidationQueue';
import { Execution } from './pages/Execution';
import { MRNVerification } from './pages/MRNVerification';
import { MyIdeas } from './pages/MyIdeas';
import { SubmitIdea } from './pages/SubmitIdea';
import { IdeaDetail } from './pages/IdeaDetail';

function HomeRedirect() {
  const user = useAuthStore((s) => s.currentUser);
  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to={user.role === 'validator' ? '/dashboard' : '/my-ideas'} replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          {/* Validator-only screens */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute roles={['validator']}>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/all-ideas"
            element={
              <ProtectedRoute roles={['validator']}>
                <AllIdeas />
              </ProtectedRoute>
            }
          />
          <Route
            path="/validation"
            element={
              <ProtectedRoute roles={['validator']}>
                <ValidationQueue />
              </ProtectedRoute>
            }
          />
          <Route
            path="/execution"
            element={
              <ProtectedRoute roles={['validator']}>
                <Execution />
              </ProtectedRoute>
            }
          />
          <Route
            path="/mrn"
            element={
              <ProtectedRoute roles={['validator']}>
                <MRNVerification />
              </ProtectedRoute>
            }
          />
          {/* Submitter-only screens */}
          <Route
            path="/my-ideas"
            element={
              <ProtectedRoute roles={['submitter']}>
                <MyIdeas />
              </ProtectedRoute>
            }
          />
          <Route
            path="/submit"
            element={
              <ProtectedRoute roles={['submitter']}>
                <SubmitIdea />
              </ProtectedRoute>
            }
          />
          {/* Shared */}
          <Route path="/ideas/:id" element={<IdeaDetail />} />
        </Route>
        <Route path="*" element={<HomeRedirect />} />
      </Routes>
    </BrowserRouter>
  );
}
