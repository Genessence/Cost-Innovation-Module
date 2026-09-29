import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { Layout } from './components/Layout';
import { CoLayout } from './components/CoLayout';
import { CiLayout } from './components/CiLayout';
import { ProtectedRoute } from './components/ProtectedRoute';
import { useAuthStore } from './store/auth';
import { Login } from './pages/Login';
import { CoinLanding } from './pages/CoinLanding';
import { CoDashboard } from './pages/co/CoDashboard';
import { CiDashboard } from './pages/ci/CiDashboard';
import { Dashboard } from './pages/Dashboard';
import { AllIdeas } from './pages/AllIdeas';
import { ValidationQueue } from './pages/ValidationQueue';
import { Execution } from './pages/Execution';
import { MRNVerification } from './pages/MRNVerification';
import { MRNDetail } from './pages/MRNDetail';
import { MyIdeas } from './pages/MyIdeas';
import { SubmitIdea } from './pages/SubmitIdea';
import { IdeaDetail } from './pages/IdeaDetail';

function HomeRedirect() {
  const user = useAuthStore((s) => s.currentUser);
  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to={user.role === 'validator' ? '/coin' : '/my-ideas'} replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        {/* COIN module selector — standalone full-screen, validator only */}
        <Route
          path="/coin"
          element={
            <ProtectedRoute roles={['validator']}>
              <CoinLanding />
            </ProtectedRoute>
          }
        />

        {/* CO module (Cost Optimization) — everything renders with the CO sidebar */}
        <Route
          element={
            <ProtectedRoute roles={['validator']}>
              <CoLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/co/dashboard" element={<CoDashboard />} />
          <Route path="/mrn" element={<MRNVerification />} />
          <Route path="/mrn/:id" element={<MRNDetail />} />
        </Route>

        {/* CI module (Cost Innovation) — everything renders with the CI sidebar */}
        <Route
          element={
            <ProtectedRoute roles={['validator']}>
              <CiLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/ci/dashboard" element={<CiDashboard />} />
          <Route path="/ci/all-ideas" element={<AllIdeas />} />
          <Route path="/validation" element={<ValidationQueue />} />
          <Route path="/execution" element={<Execution />} />
        </Route>

        {/* Combined shell — routes accessed outside the CO/CI module context */}
        <Route
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          {/* Combined dashboard + combined all-ideas — secondary access for validators */}
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
          {/* Submitter-only screens (no CO/CI modules) */}
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
          {/* Shared detail page — accessible from both modules */}
          <Route path="/ideas/:id" element={<IdeaDetail />} />
        </Route>
        <Route path="*" element={<HomeRedirect />} />
      </Routes>
    </BrowserRouter>
  );
}
