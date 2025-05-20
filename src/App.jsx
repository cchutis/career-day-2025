import * as React from "react";
import { BrowserRouter as Router, Routes, Route, Link, useParams, useLocation, useNavigate } from "react-router-dom";
import { styled } from "@mui/material/styles";
import Box from "@mui/material/Box";
import CssBaseline from "@mui/material/CssBaseline";
import Drawer from "@mui/material/Drawer";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import demos from "./demos";

const drawerWidth = 260;

const Main = styled(Box)(({ theme }) => ({
  flexGrow: 1,
  background: theme.palette.background.default,
  minHeight: "100vh",
  padding: theme.spacing(4),
}));

const StyledLink = styled(Link)(({ theme }) => ({
  color: "inherit",
  textDecoration: "none",
  width: "100%",
  display: "block",
}));


function DemoFrame() {
  const { path } = useParams();
  return (
    <Main>
      <Box sx={{ height: "80vh", width: "100%", borderRadius: 2, overflow: "hidden", boxShadow: 2, background: "#fff" }}>
        <iframe
          title={path}
          src={`/${path}/index.html`}
          style={{ width: "100%", height: "100%", border: "none" }}
        />
      </Box>
    </Main>
  );
}

import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import CardActionArea from "@mui/material/CardActionArea";
import CardContent from "@mui/material/CardContent";

const demoDescriptions = {
  "treat-collector": "Collect treats in a top-down arcade game.",
  "chatbot-demo": "Chat with a simple keyword-based bot.",
  "portfolio-page": "A mini portfolio site with navigation.",
  "turtle-graphics": "Draw with code using turtle graphics.",
  "physics-playground": "Play with physics and sliders.",
  "maze-solver": "Visualize maze solving with A*."
};

function Home() {
  return (
    <Main>
      <Typography variant="h1" gutterBottom sx={{ 
        color: '#1976d2', 
        fontWeight: 900, 
        textAlign: 'center', 
        fontSize: '3.8rem', 
        textShadow: '3px 3px 6px rgba(0,0,0,0.15)', 
        letterSpacing: '0.02em',
        fontFamily: '"Roboto Condensed", "Impact", "Arial Black", sans-serif',
        marginBottom: '20px',
        lineHeight: 1.1,
        padding: '10px 20px',
        borderRadius: '8px',
        transform: 'scale(1.02)',
        transition: 'transform 0.3s ease'
      }}>
        SOFTWARE ENGINEERS BUILD AMAZING THINGS!
      </Typography>
      <Typography variant="h5" color="text.secondary" mb={2} sx={{ textAlign: 'center' }}>
        These demos were made with big imagination and code 💻✨
      </Typography>
      <Typography variant="body1" color="primary" mb={4} sx={{ textAlign: 'center', fontSize: '1.2rem', fontWeight: 'medium' }}>
        Click any demo to try it out and see what YOU could create as a software engineer!
      </Typography>
      <Grid container spacing={3} sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
        {demos.map((demo) => (
          <Box key={demo.path} sx={{ display: 'flex', justifyContent: 'center' }}>
            <Card sx={{ width: '100%', height: 450, borderRadius: 3, boxShadow: 3, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', maxWidth: 350 }}>
              <CardActionArea
                component={Link}
                to={`/demo/${demo.path}`}
                sx={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'stretch', justifyContent: 'flex-end' }}
              >
                {/* Image area (top 3/4) */}
                <Box
                  sx={{
                    height: '100%',
                    width: '100%',
                    overflow: 'hidden',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: '#e3f2fd',
                  }}
                >
                  <Box
                    component="img"
                    src={
                      demo.path === 'treat-collector' ? '/assets/treat.png' :
                      demo.path === 'chatbot-demo' ? '/assets/chatbot.png' :
                      demo.path === 'portfolio-page' ? '/assets/portfolio.png' :
                      demo.path === 'turtle-graphics' ? '/assets/graphics.png' :
                      demo.path === 'physics-playground' ? '/assets/physics.png' :
                      demo.path === 'maze-solver' ? '/assets/maze.png' :
                      ''
                    }
                    alt={demo.name + ' demo preview'}
                    sx={{ width: '100%', height: '100%', display: 'block' }}
                  />
                </Box>
                {/* Title/Description area (bottom 1/4) */}
                <CardContent sx={{ height: '25%', p: 2, pb: 1, pt:1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-start' }}>
                  <Typography variant="h6" align="left" sx={{ fontSize: 18, width: '100%' }} gutterBottom>
                    {demo.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" align="left" sx={{ fontSize: 14, width: '100%' }}>
                    {demoDescriptions[demo.path] || ""}
                  </Typography>
                </CardContent>
              </CardActionArea>
            </Card>
          </Box>
        ))}
      </Grid>
    </Main>
  );
}

function AppBarWithBackButton() {
  const location = useLocation();
  const navigate = useNavigate();
  const isDemoPage = location.pathname.startsWith('/demo/');
  
  return (
    <AppBar
      position="fixed"
      sx={{
        background: "#1976d2",
        color: "#fff",
        boxShadow: "none",
      }}
    >
      <Toolbar>
        {isDemoPage && (
          <Button
            color="inherit"
            onClick={() => navigate('/')}
            sx={{ mr: 2 }}
          >
            ← Back
          </Button>
        )}
        <Typography variant="h6" noWrap component="div">
          {isDemoPage ? 'Back to Career Day Demo Hub' : 'Career Day Demo Hub'}
        </Typography>
      </Toolbar>
    </AppBar>
  );
}

export default function App() {
  return (
    <Router>
      <CssBaseline />
      <Routes>
        <Route path="*" element={
          <>
            <AppBarWithBackButton />
            <Toolbar />
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/demo/:path" element={<DemoFrame />} />
            </Routes>
          </>
        } />
      </Routes>
    </Router>
  );
}
