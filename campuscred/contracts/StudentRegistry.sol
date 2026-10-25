// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract StudentRegistry {
    struct Student {
        string studentId;
        string name;
        string department;
        bool isRegistered;
        bool isVerified;
    }

    address public owner;
    mapping(address => Student) public students;
    address[] public studentAddresses;

    event StudentRegistered(
        address indexed wallet,
        string studentId,
        string name,
        string department
    );

    event StudentVerified(address indexed wallet, bool verified);

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can verify");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function registerStudent(
        string memory _studentId,
        string memory _name,
        string memory _department
    ) external {
        require(!students[msg.sender].isRegistered, "Already registered");

        students[msg.sender] = Student({
            studentId: _studentId,
            name: _name,
            department: _department,
            isRegistered: true,
            isVerified: true
        });

        studentAddresses.push(msg.sender);

        emit StudentRegistered(
            msg.sender,
            _studentId,
            _name,
            _department
        );
    }

    function verifyStudent(address _student) external onlyOwner {
        require(students[_student].isRegistered, "Student not registered");
        students[_student].isVerified = true;

        emit StudentVerified(_student, true);
    }

    function getStudent(
        address _student
    ) external view returns (Student memory) {
        require(students[_student].isRegistered, "Student not found");
        return students[_student];
    }

    function isStudentRegistered(address _student) external view returns (bool) {
        return students[_student].isRegistered;
    }

}