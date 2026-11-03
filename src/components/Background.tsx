/** Ambient background: aurora blobs + grid + film grain. Rendered once in the root layout. */
export default function Background() {
  return (
    <div className="scene" aria-hidden="true">
      <div className="scene-grid" />
      <div className="aurora aurora-a" />
      <div className="aurora aurora-b" />
      <div className="aurora aurora-c" />
      <div className="scene-noise" />
    </div>
  );
}
