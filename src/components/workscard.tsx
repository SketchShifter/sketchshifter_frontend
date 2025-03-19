import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

interface CardProps {
  id: string;
  title: string;
  date: string;
  description: string;
}

const WorksCard: React.FC<CardProps> = ({ id, title, date, description }) => {
  return (
    <Card>
      <CardHeader className="flex justify-between items-center">
        <Link href={`/works/${id}`} passHref>
          <CardTitle className="m-0">{title}</CardTitle>
        </Link>
        <CardDescription className="m-0">{date}</CardDescription>
      </CardHeader>
      <CardContent>
        <p>{description}</p>
      </CardContent>
    </Card>
  );
};

export default WorksCard;
