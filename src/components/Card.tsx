import Link from 'next/link';
import { Card as MuiCard, CardContent, Typography, Box } from '@mui/material';

interface CardProps {
    id: string;
    title: string;
    created_at: string;
    description: string;
}

const Card: React.FC<CardProps> = ({ id, title, created_at, description }) => {
    return (
      <MuiCard variant="outlined">
        <CardContent>
          <Link href={`/works/${id}`} passHref>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Typography variant="h6" component="a">
                {title}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                {created_at}
              </Typography>
            </Box>
          </Link>
          <Typography variant="body2" color="textSecondary">
            {description}
          </Typography>
        </CardContent>
      </MuiCard>
    );
  };

export default Card;