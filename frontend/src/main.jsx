import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import AuthProvider from "./Context/AuthProvider.jsx";
import { BrowserRouter } from "react-router-dom";
import ClassesProvider from "./Context/ClassesProvider.jsx";
import SubjectsProvider from "./Context/SubjectProvider.jsx";
import TeacherProvider from "./Context/TeacherProvider.jsx";

createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <AuthProvider>
      <ClassesProvider>
        <SubjectsProvider>
          <TeacherProvider>
            <App />
          </TeacherProvider>
        </SubjectsProvider>
      </ClassesProvider>
    </AuthProvider>
  </BrowserRouter>,
);
