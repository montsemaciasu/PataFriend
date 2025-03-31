import "./page-layout.css";

function PageLayout({ children }) {
  return (
    <div className="background-layout">
      <div className="container py-4">{children}</div>
    </div>
  );
}

export default PageLayout;
