import { getUsersByAdmin, IUserType } from 'utils/cognito';

const LIMIT = 60;

async function main(): Promise<void> {
  const users = await getAllUsers(LIMIT);
  console.log(`Users Length: ${users.length}`);
  // console.log(users[0]);
  // console.log('\nUsers:');

  // console.log(JSON.stringify(users, null, 2));
}

export async function getAllUsers(Limit: number): Promise<IUserType[]> {
  let result: IUserType[] = [];
  let token;
  let totalCount = 0;

  console.log(`filterOutOnlyNewValues`);
  console.log(`Scan: Limit = ${Limit}`);

  do {
    const {
      Users,
      PaginationToken,
    }: {
      PaginationToken?: string;
      Users: IUserType[];
    } = await getUsersByAdmin({
      PaginationToken: token,
      Limit,
    });

    token = PaginationToken;
    totalCount += Users?.length || 0;

    result = [...result, ...(Users || [])];

    console.log(`LastEvaluatedKey: ${JSON.stringify(token)}`);
  } while (typeof token !== 'undefined');

  console.log(`Total raws: ${totalCount}`);

  return result;
}

main();
