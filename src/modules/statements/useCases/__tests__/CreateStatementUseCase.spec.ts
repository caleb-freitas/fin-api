import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { AuthenticateUserUseCase } from "../../../users/useCases/authenticateUser/AuthenticateUserUseCase";
import { CreateUserUseCase } from "../../../users/useCases/createUser/CreateUserUseCase";
import { ICreateUserDTO } from "../../../users/useCases/createUser/ICreateUserDTO";
import { OperationType } from "../../entities/Statement";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { CreateStatementError } from "../createStatement/CreateStatementError";
import { CreateStatementUseCase } from "../createStatement/CreateStatementUseCase";

let usersRepository: InMemoryUsersRepository;
let statementsRepository: InMemoryStatementsRepository;
let createUserUseCase: CreateUserUseCase;
let createStatementUseCase: CreateStatementUseCase;
let authenticateUserUseCase: AuthenticateUserUseCase;

describe("Create statement use case", () => {
  beforeEach(() => {
    usersRepository = new InMemoryUsersRepository();
    statementsRepository = new InMemoryStatementsRepository();
    createUserUseCase = new CreateUserUseCase(usersRepository);
    authenticateUserUseCase = new AuthenticateUserUseCase(usersRepository);
    createStatementUseCase = new CreateStatementUseCase(
      usersRepository,
      statementsRepository
    );
  });
  it("should be able to create a new deposit", async () => {
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
    expect(deposit).toHaveProperty("type", "deposit");
    expect(deposit).toHaveProperty("amount", deposit.amount);
  });
  it("should be able to create a new withdraw", async () => {
    const user: ICreateUserDTO = {
      name: "username",
      email: "username@email.com",
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
    const withdraw = await createStatementUseCase.execute({
      user_id: token.user.id as string,
      type: OperationType.WITHDRAW,
      amount: 500,
      description: "withdraw_description",
    });
    expect(withdraw).toHaveProperty("type", "withdraw");
    expect(withdraw).toHaveProperty("amount", 500);
  });
  it("should not be able to make a statement if a user does not exists", async () => {
    expect(async () => {
      await createStatementUseCase.execute({
        user_id: "non-existing-id",
        type: OperationType.DEPOSIT,
        amount: 1000,
        description: "deposit_description",
      });
    }).rejects.toBeInstanceOf(CreateStatementError.UserNotFound);
  });
  it("should not be able to create a withdrawal if the balance is less than the requested amount", async () => {
    expect(async () => {
      const user: ICreateUserDTO = {
        name: "username",
        email: "username@email.com",
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
      const withdraw = await createStatementUseCase.execute({
        user_id: token.user.id as string,
        type: OperationType.WITHDRAW,
        amount: 2000,
        description: "withdraw_description",
      });
    }).rejects.toBeInstanceOf(CreateStatementError.InsufficientFunds);
  });
});
