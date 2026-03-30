import img from"../assets/cursor.png"
import "../Css/Mouse.css";

type MousePointerData = {
  color: string;
  RelativeX: number;
  RelativeY: number; 
  name: string;
};

export function MousePtr({ color, RelativeX, RelativeY, name }: MousePointerData) {

  const x = RelativeX * window.innerWidth;
  const y = RelativeY * window.innerHeight;

  return (
    <div
      style={{
        transform: `translate(${x}px, ${y}px)`,
        color: color
      }}
    >
      <img 
        src={img}
        style={{ width: "40px" }}  
      ></img>
      <strong className="cursor-name">{name}</strong>
    </div>
  );
}