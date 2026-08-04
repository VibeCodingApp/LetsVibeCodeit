import { getAppRows } from '@/lib/apps';

export const dynamic = 'force-static';

export function GET() {
  return Response.json(getAppRows());
}
