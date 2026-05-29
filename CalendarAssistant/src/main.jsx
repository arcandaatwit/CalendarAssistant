import { useState } from "react";
import { useNavigate } from "react-router-dom";

function MainPage() {
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div style={styles.wrapper}>
      <h1>My Calendar</h1>

    </div>
  );
}

const styles = {
  wrapper: {
    width: "80%",
    margin: "40px auto",
    textAlign: "center",
  },
  calendarGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(7, 1fr)",
    gap: "5px",
    marginTop: "20px",
  },
  dayHeader: {
    fontWeight: "bold",
    padding: "10px",
    backgroundColor: "#eee",
  },
  dayCell: {
    height: "80px",
    border: "1px solid #ccc",
    padding: "5px",
    textAlign: "left",
  },
};

export default MainPage;
