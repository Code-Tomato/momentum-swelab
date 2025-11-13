import { Button } from "@mui/material";

const JoinButton = ({ joined, onClick }) => {
  return (
    <Button
      variant="contained"
      size="small"
      color={joined ? "secondary" : "primary"}
      onClick={onClick}
      sx={{
        width: 80,
        textTransform: "none",
        backgroundColor: joined ? "#ccc" : "#e0e0e0",
        color: "#000",
        "&:hover": { backgroundColor: joined ? "#bdbdbd" : "#d5d5d5" },
      }}
    >
      {joined ? "Leave" : "Join"}
    </Button>
  );
};

export default JoinButton;
