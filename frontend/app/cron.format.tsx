import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function CronFormat() {
  return (
    <Card className="w-full max-w-lg mt-8">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">
          Cron Format Reference
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="w-full">
          <pre className="font-mono text-sm leading-6 bg-gray-100 p-4 rounded-md overflow-x-auto min-w-full block">
            {`*    *    *    *    *    *
┬    ┬    ┬    ┬    ┬    ┬
│    │    │    │    │    │
│    │    │    │    │    └─ day of week (0-7, 1L-7L) (0 or 7 is Sun)
│    │    │    │    └────── month (1-12, JAN-DEC)
│    │    │    └─────────── day of month (1-31, L)
│    │    └──────────────── hour (0-23)
│    └───────────────────── minute (0-59)
└────────────────────────── second (0-59, optional)`}
          </pre>
        </div>
      </CardContent>
    </Card>
  );
}
