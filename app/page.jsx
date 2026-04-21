import articles from "../content/articles/seo-articles.json";

export default function Home() {
  return (
    <main style={{ padding: "40px", maxWidth: "1200px", margin: "auto" }}>
      
      <h1 style={{ fontSize: "28px", marginBottom: "30px" }}>
        المقالات المميزة
      </h1>

      <div style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: "30px"
      }}>
        
        {articles.map((article, index) => (
          
          <a
            key={index}
            href={`/article-${index + 1}`}
            style={{
              textDecoration: "none",
              color: "inherit"
            }}
          >
            <div style={{
              background: "#fff",
              borderRadius: "20px",
              padding: "20px",
              boxShadow: "0 10px 30px rgba(0,0,0,0.05)"
            }}>

              <img
                src={article.image}
                alt={article.title}
                style={{
                  width: "100%",
                  height: "220px",
                  objectFit: "cover",
                  borderRadius: "12px",
                  marginBottom: "15px"
                }}
                onError={(e) => {
                  e.target.src =
                    "https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=1200&q=80";
                }}
              />

              <h2 style={{ fontSize: "22px", marginBottom: "10px" }}>
                {article.title}
              </h2>

              <p style={{ color: "#555", lineHeight: "1.6" }}>
                {article.description}
              </p>

            </div>
          </a>

        ))}

      </div>

    </main>
  );
}
