import img from"../assets/cursor.png"
import "../Css/Mouse.css";

type MousePointerData = {
  color: string;
  RelativeX: number;
  RelativeY: number;
  name: string;
  cursor?: string;
};

export function MousePtr({ color, RelativeX, RelativeY, name, cursor }: MousePointerData) {

  const x = RelativeX * window.innerWidth;
  const y = RelativeY * window.innerHeight;

  return (
    <div
      style={{
        transform: `translate(${x}px, ${y}px)`,
        color: color
      }}
    >
      {cursor ? (
        <span style={{ fontSize: "32px", lineHeight: 1, display: "block" }}>{cursor}</span>
      ) : (
        <img src={img} style={{ width: "40px" }} />
      )}
      <strong className="cursor-name">{name}</strong>
    </div>
  );
}