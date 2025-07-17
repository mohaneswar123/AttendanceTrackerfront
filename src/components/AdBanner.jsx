import { useEffect } from "react";

function AdBanner() {
  useEffect(() => {
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (e) {
      console.error("Adsbygoogle error:", e);
    }
  }, []);

  return (
    <ins
      className="adsbygoogle"
      style={{ display: "block", textAlign: "center", margin: "24px 0" }}
      data-ad-client="ca-pub-8050610790386120"
      data-ad-slot="3627716758"
      data-ad-format="auto"
      data-full-width-responsive="true"
    ></ins>
  );
}

export default AdBanner;
