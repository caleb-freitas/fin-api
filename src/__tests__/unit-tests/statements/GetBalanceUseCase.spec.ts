import { OperationType } from "../../../modules/statements/entities/Statement";
import { InMemoryStatementsRepository } from "../../../modules/statements/repositories/in-memory/InMemoryStatementsRepository";
import { CreateStatementUseCase } from "../../../modules/statements/useCases/createStatement/CreateStatementUseCase";
import { GetBalanceError } from "../../../modules/statements/useCases/getBalance/GetBalanceError";
import { GetBalanceUseCase } from "../../../modules/statements/useCases/getBalance/GetBalanceUseCase";
import { InMemoryUsersRepository } from "../../../modules/users/repositories/in-memory/InMemoryUsersRepository";
import { AuthenticateUserUseCase } from "../../../modules/users/useCases/authenticateUser/AuthenticateUserUseCase";
import { CreateUserUseCase } from "../../../modules/users/useCases/createUser/CreateUserUseCase";
import { ICreateUserDTO } from "../../../modules/users/useCases/createUser/ICreateUserDTO";

let usersRepository: InMemoryUsersRepository;
let statementsRepository: InMemoryStatementsRepository;
let createUserUseCase: CreateUserUseCase;
let authenticateUserUseCase: AuthenticateUserUseCase;
let createStatementUseCase: CreateStatementUseCase;
let getBalanceUseCase: GetBalanceUseCase;

describe("Get balance use case", () => {
  beforeEach(() => {
    usersRepository = new InMemoryUsersRepository();
    statementsRepository = new InMemoryStatementsRepository();
    createUserUseCase = new CreateUserUseCase(usersRepository);
    authenticateUserUseCase = new AuthenticateUserUseCase(usersRepository);
    createStatementUseCase = new CreateStatementUseCase(
      usersRepository,
      statementsRepository
    );
    getBalanceUseCase = new GetBalanceUseCase(
      statementsRepository,
      usersRepository
    );
  });
  it("should be able to get a balance from a user", async () => {
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
    await createStatementUseCase.execute({
      user_id: token.user.id as string,
      type: OperationType.DEPOSIT,
      amount: 1000,
      description: "deposit_description",
    });
    await createStatementUseCase.execute({
      user_id: token.user.id as string,
      type: OperationType.WITHDRAW,
      amount: 500,
      description: "withdraw_description",
    });
    const balance = await getBalanceUseCase.execute({
      user_id: token.user.id as string,
    });
    expect(balance).toHaveProperty("balance");
    expect(balance).toHaveProperty("statement");
  });
  it("should not be able to get balance from a non-existing user", async () => {
    expect(async () => {
      await getBalanceUseCase.execute({
        user_id: "non-existing id",
      });
    }).rejects.toBeInstanceOf(GetBalanceError);
  });
});
