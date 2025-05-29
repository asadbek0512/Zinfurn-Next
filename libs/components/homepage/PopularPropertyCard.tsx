import React, { useState, useEffect } from 'react';
import { Card, CardContent, Typography, Button, Box, Chip, IconButton } from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import { Property } from '../../types/property/property';
import { T } from '../../types/common';

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

interface FlashSaleCardsProps {
  properties: Property[];
  likePropertyHandler: (user: T, id: string) => void;
}

const FlashSaleCards = ({ properties, likePropertyHandler }: FlashSaleCardsProps) => {
  // DEBUG: Ma'lumotlarni console ga chiqarish
  console.log('All properties received:', properties);
  console.log('Properties count:', properties.length);
  
  // Har bir property uchun alohida tekshirish
  properties.forEach((property: any, index: number) => {
    console.log(`Property ${index}:`, {
      id: property._id,
      title: property.propertyTitle,
      isOnSale: property.propertyIsOnSale,
      saleExpiresAt: property.propertySaleExpiresAt,
      salePrice: property.propertySalePrice,
      originalPrice: property.propertyPrice
    });
  });

  // Eng yaqin muddat tugaydigan ikkita propertyni topish
  const getClosestSaleProperties = () => {
    const now = new Date();
    console.log('Current time:', now);
    
    // Birinchi filter - propertyIsOnSale
    const onSaleProperties = properties.filter((property: any) => {
      console.log(`Property ${property.propertyTitle} - isOnSale:`, property.propertyIsOnSale);
      return property.propertyIsOnSale;
    });
    console.log('Properties with isOnSale true:', onSaleProperties.length);
    
    // Ikkinchi filter - propertySaleExpiresAt mavjudligi
    const withExpiryDate = onSaleProperties.filter((property: any) => {
      console.log(`Property ${property.propertyTitle} - saleExpiresAt:`, property.propertySaleExpiresAt);
      return property.propertySaleExpiresAt;
    });
    console.log('Properties with expiry date:', withExpiryDate.length);
    
    // Uchinchi filter - muddat tugamaganlar
    const activeProperties = withExpiryDate.filter((property: any) => {
      const expiryDate = new Date(property.propertySaleExpiresAt!);
      const isActive = expiryDate > now;
      console.log(`Property ${property.propertyTitle} - expires: ${expiryDate}, isActive:`, isActive);
      return isActive;
    });
    console.log('Active sale properties:', activeProperties.length);
    
    return activeProperties
      .sort((a, b) => new Date(a.propertySaleExpiresAt!).getTime() - new Date(b.propertySaleExpiresAt!).getTime())
      .slice(0, 2);
  };

  const saleProperties = getClosestSaleProperties();
  console.log('Final sale properties:', saleProperties);
  
  const [timeLeft, setTimeLeft] = useState<TimeLeft[]>([
    { days: 0, hours: 0, minutes: 0, seconds: 0 },
    { days: 0, hours: 0, minutes: 0, seconds: 0 }
  ]);

  const calculateTimeLeft = (targetDate: Date) => {
    const now = new Date();
    const difference = new Date(targetDate).getTime() - now.getTime();

    if (difference > 0) {
      return {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60)
      };
    }
    return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  };

  useEffect(() => {
    const timer = setInterval(() => {
      const newTimeLeft = saleProperties.map(property => 
        calculateTimeLeft(property.propertySaleExpiresAt!)
      );
      setTimeLeft(newTimeLeft);
    }, 1000);

    return () => clearInterval(timer);
  }, [saleProperties]);

  const handleViewDetails = (propertyId: string) => {
    console.log(`Navigating to property ${propertyId} details`);
    // navigation logic: navigate(`/property/${propertyId}`)
  };

  const formatTime = (time: number) => {
    return time.toString().padStart(2, '0');
  };

  const calculateSalePercentage = (originalPrice: number, salePrice: number) => {
    return Math.round(((originalPrice - salePrice) / originalPrice) * 100);
  };

  // TEMPORARY: Agar hech qanday sale property bo'lmasa, barcha propertylarni ko'rsatish
  if (saleProperties.length === 0) {
    console.log('No sale properties found, showing debug info');
    return (
      <Box component={'div'} sx={{ textAlign: 'center', py: 8 }}>
        <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
          No active flash sales at the moment
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Debug info (check console for details):
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Total properties: {properties.length}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Properties with sale flag: {properties.filter((p: any) => p.propertyIsOnSale).length}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Properties with expiry date: {properties.filter((p: any) => p.propertySaleExpiresAt).length}
        </Typography>
        
        {/* TEST: Birinchi propertyni sale sifatida ko'rsatish */}
        {properties.length > 0 && (
          <Box component={'div'} sx={{ mt: 4 }}>
            <Typography variant="h6" color="primary">
              Test Mode - Showing first property as sale:
            </Typography>
            <Typography variant="body2">
              {properties[0].propertyTitle}
            </Typography>
          </Box>
        )}
      </Box>
    );
  }

  return (
    <Box component={'div'} sx={{ display: 'flex', gap: 3, flexWrap: 'wrap', justifyContent: 'center' }}>
      {saleProperties.map((property, index) => {
        const salePercentage = property.propertySalePrice 
          ? calculateSalePercentage(property.propertyPrice, property.propertySalePrice)
          : 0;

        return (
          <Card 
            key={property._id} 
            sx={{ 
              width: 450, 
              height: 400,
              position: 'relative',
              backgroundImage: `url(${property.propertyImages?.[0] || '/default-property.jpg'})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0,0,0,0.4)',
                zIndex: 1
              }
            }}
          >
            <CardContent sx={{ 
              position: 'relative', 
              zIndex: 2, 
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              color: 'white'
            }}>
              
              {/* Sale Badge */}
              <Chip 
                label={`${salePercentage}% OFF`}
                color="error"
                sx={{ position: 'absolute', top: 16, left: 16, fontWeight: 'bold' }}
              />

              {/* Like Button */}
              <IconButton 
                sx={{ position: 'absolute', top: 16, right: 16, color: 'white' }}
                onClick={() => likePropertyHandler({} as T, property._id)}
              >
                {property.meLiked && property.meLiked.length > 0 ? 
                  <FavoriteIcon sx={{ color: 'red' }} /> : 
                  <FavoriteBorderIcon />
                }
              </IconButton>

              {/* Title */}
              <Typography variant="h4" align="center" sx={{ mb: 2, fontWeight: 'bold' }}>
                Flash Sale!
              </Typography>
              
              <Typography variant="h6" align="center" sx={{ mb: 4, opacity: 0.9 }}>
                Get {salePercentage}% off - Limited Time Offer!
              </Typography>

              {/* Countdown */}
              <Box component={'div'} sx={{ display: 'flex', gap: 2, mb: 4 }}>
                <Box component={'div'} sx={{ textAlign: 'center' }}>
                  <Box component={'div'} sx={{ 
                    bgcolor: 'rgba(0,0,0,0.6)', 
                    borderRadius: 1, 
                    p: 1, 
                    minWidth: 50,
                    fontSize: '1.5rem',
                    fontWeight: 'bold'
                  }}>
                    {formatTime(timeLeft[index].days)}
                  </Box>
                  <Typography variant="caption">Days</Typography>
                </Box>
                <Typography variant="h4" sx={{ alignSelf: 'center' }}>:</Typography>
                <Box component={'div'} sx={{ textAlign: 'center' }}>
                  <Box component={'div'} sx={{ 
                    bgcolor: 'rgba(0,0,0,0.6)', 
                    borderRadius: 1, 
                    p: 1, 
                    minWidth: 50,
                    fontSize: '1.5rem',
                    fontWeight: 'bold'
                  }}>
                    {formatTime(timeLeft[index].hours)}
                  </Box>
                  <Typography variant="caption">Hours</Typography>
                </Box>
                <Typography variant="h4" sx={{ alignSelf: 'center' }}>:</Typography>
                <Box component={'div'} sx={{ textAlign: 'center' }}>
                  <Box component={'div'} sx={{ 
                    bgcolor: 'rgba(0,0,0,0.6)', 
                    borderRadius: 1, 
                    p: 1, 
                    minWidth: 50,
                    fontSize: '1.5rem',
                    fontWeight: 'bold'
                  }}>
                    {formatTime(timeLeft[index].minutes)}
                  </Box>
                  <Typography variant="caption">Minutes</Typography>
                </Box>
                <Typography variant="h4" sx={{ alignSelf: 'center' }}>:</Typography>
                <Box component={'div'} sx={{ textAlign: 'center' }}>
                  <Box component={'div'} sx={{ 
                    bgcolor: 'rgba(0,0,0,0.6)', 
                    borderRadius: 1, 
                    p: 1, 
                    minWidth: 50,
                    fontSize: '1.5rem',
                    fontWeight: 'bold'
                  }}>
                    {formatTime(timeLeft[index].seconds)}
                  </Box>
                  <Typography variant="caption">Seconds</Typography>
                </Box>
              </Box>

              {/* Property Title */}
              <Typography variant="h6" align="center" sx={{ mb: 3, fontWeight: 'bold' }}>
                {property.propertyTitle}
              </Typography>

              {/* View Details Button */}
              <Button
                variant="contained"
                color="success"
                size="large"
                onClick={() => handleViewDetails(property._id)}
                sx={{ 
                  borderRadius: 25,
                  px: 4,
                  py: 1.5,
                  fontWeight: 'bold',
                  '&:hover': {
                    transform: 'scale(1.05)'
                  }
                }}
              >
                View Details →
              </Button>
            </CardContent>
          </Card>
        );
      })}
    </Box>
  );
};

export default FlashSaleCards;