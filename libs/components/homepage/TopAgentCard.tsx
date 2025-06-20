"use client"
import { useRouter } from "next/navigation"
import { Stack, Box, Typography, IconButton } from "@mui/material"
import { Instagram, Twitter } from "@mui/icons-material"
import useDeviceDetect from "../../hooks/useDeviceDetect"
import type { Member } from "../../types/member/member"
import { useTranslation } from 'next-i18next';


interface TopAgentProps {
  agent: Member
}

const TopAgentCard = (props: TopAgentProps) => {
  const { agent } = props
  const { t } = useTranslation('common');
  const device = useDeviceDetect()
  const router = useRouter()
  const agentImage = agent?.memberImage
    ? `${process.env.REACT_APP_API_URL}/${agent?.memberImage}`
    : "/img/profile/defaultUser.svg"

  /** HANDLERS **/
  const handleAgentClick = () => {
    // Navigate to agent profile
    console.log("Navigate to agent:", agent?.memberNick)
  }

  if (device === "mobile") {
    return (
      <Box
        component={"div"}
        className="top-agent-card"
        sx={{
          position: "relative",
          width: "280px",
          height: "320px",
          borderRadius: "16px",
          overflow: "hidden",
          cursor: "pointer",
          transition: "transform 0.3s ease, box-shadow 0.3s ease",
          "&:hover": {
            transform: "translateY(-5px)",
            boxShadow: "0px 15px 30px rgba(0, 0, 0, 0.1)",
          },
        }}
        onClick={handleAgentClick}
      >
        {/* Main Image */}
        <Box
          component="img"
          src={agentImage}
          alt={agent?.memberNick}
          sx={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            borderRadius: "16px",
          }}
        />

        {/* Bottom Overlay Banner */}
        <Box  component="div"
          sx={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            backgroundColor: "rgba(45, 55, 72, 0.9)",
            borderBottomLeftRadius: "16px",
            borderBottomRightRadius: "16px",
            padding: "16px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Box  component="div">
            <Typography
              variant="h6"
              sx={{
                color: "white",
                fontWeight: "600",
                fontSize: "16px",
                lineHeight: 1.2,
                mb: 0.5,
              }}
            >
              {agent?.memberNick}
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: "rgba(255, 255, 255, 0.8)",
                fontSize: "13px",
                lineHeight: 1.2,
              }}
            >
              {agent?.memberType}
            </Typography>
          </Box>

          <Stack direction="row" spacing={0.5}>
            <IconButton
              size="small"
              sx={{
                color: "white",
                backgroundColor: "rgba(255, 255, 255, 0.1)",
                width: "28px",
                height: "28px",
                "&:hover": {
                  backgroundColor: "rgba(255, 255, 255, 0.2)",
                },
              }}
            >
              <Instagram sx={{ fontSize: "16px" }} />
            </IconButton>
            <IconButton
              size="small"
              sx={{
                color: "white",
                backgroundColor: "rgba(255, 255, 255, 0.1)",
                width: "28px",
                height: "28px",
                "&:hover": {
                  backgroundColor: "rgba(255, 255, 255, 0.2)",
                },
              }}
            >
              <Twitter sx={{ fontSize: "16px" }} />
            </IconButton>
          </Stack>
        </Box>
      </Box>
    )
  } else {
    return (
      <Box
        component={"div"}
        className="top-agent-card"
        sx={{
          position: "relative",
          width: "300px",
          height: "360px",
          borderRadius: "16px",
          overflow: "hidden",
          cursor: "pointer",
          transition: "transform 0.3s ease, box-shadow 0.3s ease",
          "&:hover": {
            transform: "translateY(-5px)",
            boxShadow: "0px 15px 30px rgba(0, 0, 0, 0.1)",
          },
        }}
        onClick={handleAgentClick}
      >
        {/* Main Image */}
        <Box
          component="img"
          src={agentImage}
          alt={agent?.memberNick}
          sx={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            borderRadius: "16px",
          }}
        />

        {/* Bottom Overlay Banner */}
        <Box 
				 component="div"
          sx={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            backgroundColor: "rgba(45, 55, 72, 0.9)",
            borderBottomLeftRadius: "16px",
            borderBottomRightRadius: "16px",
            padding: "20px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Box  component="div">
						
            <Typography
              variant="h6"
              sx={{
                color: "white",
                fontWeight: "600",
                fontSize: "18px",
                lineHeight: 1.2,
                mb: 0.5,
              }}
            >
              {agent?.memberNick}
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: "rgba(255, 255, 255, 0.8)",
                fontSize: "14px",
                lineHeight: 1.2,
              }}
            >
            {t(agent?.memberType)}
            </Typography>
          </Box>

          <Stack direction="row" spacing={0.5}>
            <IconButton
              size="small"
              sx={{
                color: "white",
                backgroundColor: "rgba(255, 255, 255, 0.1)",
                width: "32px",
                height: "32px",
                "&:hover": {
                  backgroundColor: "rgba(255, 255, 255, 0.2)",
                },
              }}
            >
              <Instagram sx={{ fontSize: "18px" }} />
            </IconButton>
            <IconButton
              size="small"
              sx={{
                color: "white",
                backgroundColor: "rgba(255, 255, 255, 0.1)",
                width: "32px",
                height: "32px",
                "&:hover": {
                  backgroundColor: "rgba(255, 255, 255, 0.2)",
                },
              }}
            >
              <Twitter sx={{ fontSize: "18px" }} />
            </IconButton>
          </Stack>
        </Box>
      </Box>
    )
  }
}

export default TopAgentCard
