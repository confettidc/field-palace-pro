import { useLocation } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="d-flex min-vh-100 align-items-center justify-content-center" style={{ backgroundColor: "var(--background)" }}>
      <div className="text-center">
        <h1 className="mb-4 fw-bold" style={{ fontSize: "2.5rem" }}>404</h1>
        <p className="mb-4 fs-5 text-muted">Oops! Page not found</p>
        <a href="/" className="text-decoration-underline" style={{ color: "var(--primary)" }}>
          Return to Home
        </a>
      </div>
    </div>
  );
};

export default NotFound;
