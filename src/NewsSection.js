import { useEffect, useState } from "react";
import axios from "axios";

export default function NewsSection() {
  const [news, setNews] = useState([]);

  useEffect(() => {
    async function load() {
      const res = await axios.get(
        `https://newsapi.org/v2/top-headlines?category=technology&language=en&pageSize=8&apiKey=97d62933447e4821a415a920da640ffe

`
      );

      setNews(res.data.articles);
    }

    load();
  }, []);

  return (
    <div>
      <h2>AI Powered Tech & Education News</h2>

      {news.map((n, i) => (
        <div key={i}>
          <h3>{n.title}</h3>
          <p>{(n.description || "").split(" ").slice(0, 30).join(" ")}...</p>
          <a href={n.url} target="_blank" rel="noreferrer">Read More</a>
          <hr />
        </div>
      ))}
    </div>
  );
}
