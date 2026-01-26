import { Route, Routes } from "react-router-dom";
import ProtectedRoutes from "./ProtectedRoutes";
import PublicRoutes from "./PublicRoutes";
import Login from "../../Pages/login_signup/Login";
import Register from "../../Pages/login_signup/Register";
import ForgotPass from "../../Pages/login_signup/ForgotPass";
import Dashboard from "../../Pages/app_main/dashboard/Dashboard";
import Classes from "../../Pages/app_main/classes/Classes";
import Teachers from "../../Pages/app_main/teachers/Teachers";
import Error404 from "../../Pages/error/Error404";
import Subjects from "../../Pages/app_main/subjects/Subjects";
import LandingPage from "../../Pages/landing_page/LandingPage";
import SubjectCreatePage from "../../Pages/app_main/subjects/Pages/SubjectCreatePage/SubjectCreatePage";
import TeacherDetailsEditPage from "../../Pages/app_main/teachers/Pages/TeacherDetailsEdit/TeacherDetailsEditPage";
import TermsAndConditions from "../../Pages/legal/termsAndConditions/TermsAndConditions";
import TimeTableCreate from "../../Pages/app_main/dashboard/Pages/TimeTableCreatePage/TimeTableCreate";

const RouteManager = () => {
  return (
    <Routes>
      {/* Public */}
      <Route
        path="/"
        element={
          <PublicRoutes>
            <LandingPage />
          </PublicRoutes>
        }
      />
      <Route
        path="/login"
        element={
          <PublicRoutes>
            <Login />
          </PublicRoutes>
        }
      />
      <Route
        path="/register"
        element={
          <PublicRoutes>
            <Register />
          </PublicRoutes>
        }
      />
      <Route
        path="/forgotpass"
        element={
          <PublicRoutes>
            <ForgotPass />
          </PublicRoutes>
        }
      />
      <Route
        path="/terms&conditions"
        element={
          <PublicRoutes>
            <TermsAndConditions />
          </PublicRoutes>
        }
      />

      {/* Protected */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoutes>
            <Dashboard />
          </ProtectedRoutes>
        }
      />
      <Route
        path="/dashboard/timetables/create"
        element={
          <ProtectedRoutes>
            <TimeTableCreate />
          </ProtectedRoutes>
        }
      />
      <Route
        path="/classes"
        element={
          <ProtectedRoutes>
            <Classes />
          </ProtectedRoutes>
        }
      />
      <Route
        path="/subjects"
        element={
          <ProtectedRoutes>
            <Subjects />
          </ProtectedRoutes>
        }
      />
      <Route
        path="/subjects/new"
        element={
          <ProtectedRoutes>
            <SubjectCreatePage />
          </ProtectedRoutes>
        }
      />
      <Route
        path="/teachers"
        element={
          <ProtectedRoutes>
            <Teachers />
          </ProtectedRoutes>
        }
      />

      <Route
        path="/teachers/teacher/:teacherid"
        element={
          <ProtectedRoutes>
            <TeacherDetailsEditPage />
          </ProtectedRoutes>
        }
      />

      <Route path="*" element={<Error404 />} />
    </Routes>
  );
};

export default RouteManager;
