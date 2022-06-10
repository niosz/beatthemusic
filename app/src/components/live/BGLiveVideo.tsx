export const BGLiveVideo = () => {
  return (
    <video
      autoPlay
      muted
      loop
      style={{
        position: "absolute",
        objectFit: "cover",
        width: "100vw",
        height: "100vh",
      }}
    >
      <source src="/assets/bg.mp4" />
    </video>
  );
};
