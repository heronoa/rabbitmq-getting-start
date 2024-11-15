const userMocks = [
  {
    name: "User 1",
    email: "test@example.com",
    password: "encrypted-hash",
    username: "tester1",
  },
  {
    name: "User 2",
    email: "test2@example.com",
    password: "encrypted-hash2",
    username: "tester2",
    role: "user",
  },
  {
    name: "User 3",
    email: "test3@example.com",
    password: "encrypted-hash3",
    username: "tester3",
    role: "user",
  },
];

const adminMock = {
  "name": "joe mano admin",
  "email": "admin1@example.com",
  "password": "senha123",
  "username": "testadmin",
  "role": "admin"
}

module.exports = {userMocks, adminMock};
