import { OperationType } from "../../../modules/statements/entities/Statement";
import { InMemoryStatementsRepository } from "../../../modules/statements/repositories/in-memory/InMemoryStatementsRepository";
import { CreateStatementUseCase } from "../../../modules/statements/useCases/createStatement/CreateStatementUseCase";
import { GetStatementOperationError } from "../../../modules/statements/useCases/getStatementOperation/GetStatementOperationError";
import { GetStatementOperationUseCase } from "../../../modules/statements/useCases/getStatementOperation/GetStatementOperationUseCase";
import { InMemoryUsersRepository } from "../../../modules/users/repositories/in-memory/InMemoryUsersRepository";
import { AuthenticateUserUseCase } from "../../../modules/users/useCases/authenticateUser/AuthenticateUserUseCase";
import { CreateUserUseCase } from "../../../modules/users/useCases/createUser/CreateUserUseCase";
import { ICreateUserDTO } from "../../../modules/users/useCases/createUser/ICreateUserDTO";

let usersRepository: InMemoryUsersRepository;
let statementsRepository: InMemoryStatementsRepository;
let createUserUseCase: CreateUserUseCase;
let createStatementUseCase: CreateStatementUseCase;
let authenticateUserUseCase: AuthenticateUserUseCase;
let getStatementOperationUseCase: GetStatementOperationUseCase;

describe("Get statement operation use case", () => {
  beforeEach(() => {
    usersRepository = new InMemoryUsersRepository();
    statementsRepository = new InMemoryStatementsRepository();
    createUserUseCase = new CreateUserUseCase(usersRepository);
    authenticateUserUseCase = new AuthenticateUserUseCase(usersRepository);
    createStatementUseCase = new CreateStatementUseCase(
      usersRepository,
      statementsRepository
    );
    getStatementOperationUseCase = new GetStatementOperationUseCase(
      usersRepository,
      statementsRepository
    );
  });
  it("should be able to get statement operation from a user", async () => {
    const user: ICreateUserDTO = {
      name: "username",
      email: "user@email.com",
      password: "123456",
    };
    await createUserUseCase.execute(user);
    const token = await authenticateUserUseCase.execute({
      email: user.email,
      password: user.password,
    });
    const deposit = await createStatementUseCase.execute({
      user_id: token.user.id as string,
      type: OperationType.DEPOSIT,
      amount: 1000,
      description: "deposit_description",
    });
    const withdraw = await createStatementUseCase.execute({
      user_id: token.user.id as string,
      type: OperationType.WITHDRAW,
      amount: 500,
      description: "withdraw_description",
    });
    const depositOperation = await getStatementOperationUseCase.execute({
      user_id: token.user.id as string,
      statement_id: deposit.id as string,
    });
    const withdrawOperation = await getStatementOperationUseCase.execute({
      user_id: token.user.id as string,
      statement_id: withdraw.id as string,
    });
    expect(depositOperation).toHaveProperty("id", deposit.id);
    expect(depositOperation).toHaveProperty("user_id", token.user.id);
    expect(withdrawOperation).toHaveProperty("id", withdraw.id);
    expect(withdrawOperation).toHaveProperty("user_id", token.user.id);
  });
  it("should not be able to get a statement operation if a user does not exists", async () => {
    expect(async () => {
      await getStatementOperationUseCase.execute({
        user_id: "non-existing-user-id",
        statement_id: "non-existing-statement-id",
      });
    }).rejects.toBeInstanceOf(GetStatementOperationError.UserNotFound);
  });
  it("should not be able to get a statement operation if a statement does not exists", async () => {
    expect(async () => {
      const user: ICreateUserDTO = {
        name: "username",
        email: "user@email.com",
        password: "123456",
      };
      await createUserUseCase.execute(user);
      const token = await authenticateUserUseCase.execute({
        email: user.email,
        password: user.password,
      });
      await getStatementOperationUseCase.execute({
        user_id: token.user.id as string,
        statement_id: "something_else",
      });
    }).rejects.toBeInstanceOf(GetStatementOperationError.StatementNotFound);
  });
});
