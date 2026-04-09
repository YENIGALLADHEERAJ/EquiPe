CREATE DATABASE IF NOT EXISTS equipe;
USE equipe;

CREATE TABLE IF NOT EXISTS Users (
  UserID INT AUTO_INCREMENT PRIMARY KEY,
  Name VARCHAR(255) NOT NULL,
  Email VARCHAR(255) NOT NULL UNIQUE,
  Password VARCHAR(255) NOT NULL,
  Phone VARCHAR(20),
  JoinDate DATETIME DEFAULT CURRENT_TIMESTAMP,
  WalletBalance DECIMAL(10, 2) DEFAULT 0.00
);

CREATE TABLE IF NOT EXISTS UserGroups (
  GroupID INT AUTO_INCREMENT PRIMARY KEY,
  GroupName VARCHAR(255) NOT NULL,
  Description TEXT,
  CreationDate DATETIME DEFAULT CURRENT_TIMESTAMP,
  InviteCode VARCHAR(16) NOT NULL UNIQUE,
  CreatedByUserID INT NOT NULL,
  FOREIGN KEY (CreatedByUserID) REFERENCES Users(UserID) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS GroupMembers (
  UserID INT NOT NULL,
  GroupID INT NOT NULL,
  IsAdmin TINYINT(1) DEFAULT 0,
  JoinDate DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (UserID, GroupID),
  FOREIGN KEY (UserID) REFERENCES Users(UserID) ON DELETE CASCADE,
  FOREIGN KEY (GroupID) REFERENCES UserGroups(GroupID) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS Expenses (
  ExpenseID INT AUTO_INCREMENT PRIMARY KEY,
  GroupID INT NOT NULL,
  PaidByUserID INT NOT NULL,
  Amount DECIMAL(10, 2) NOT NULL,
  Description VARCHAR(500) NOT NULL,
  Date DATETIME DEFAULT CURRENT_TIMESTAMP,
  IsSettled TINYINT(1) DEFAULT 0,
  FOREIGN KEY (GroupID) REFERENCES UserGroups(GroupID) ON DELETE CASCADE,
  FOREIGN KEY (PaidByUserID) REFERENCES Users(UserID) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS Settlements (
  SettlementID INT AUTO_INCREMENT PRIMARY KEY,
  GroupID INT NOT NULL,
  PayerUserID INT NOT NULL,
  ReceiverUserID INT NOT NULL,
  Amount DECIMAL(10, 2) NOT NULL,
  Date DATETIME DEFAULT CURRENT_TIMESTAMP,
  Status ENUM('pending', 'completed') DEFAULT 'pending',
  FOREIGN KEY (GroupID) REFERENCES UserGroups(GroupID) ON DELETE CASCADE,
  FOREIGN KEY (PayerUserID) REFERENCES Users(UserID) ON DELETE CASCADE,
  FOREIGN KEY (ReceiverUserID) REFERENCES Users(UserID) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS Notifications (
  NotificationID INT AUTO_INCREMENT PRIMARY KEY,
  UserID INT NOT NULL,
  Message TEXT NOT NULL,
  Type VARCHAR(50) DEFAULT 'info',
  IsRead TINYINT(1) DEFAULT 0,
  CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (UserID) REFERENCES Users(UserID) ON DELETE CASCADE
);

CREATE OR REPLACE VIEW GroupLedger AS
SELECT
  gm.UserID,
  u.Name AS UserName,
  gm.GroupID,
  ug.GroupName,
  COALESCE(SUM(CASE WHEN e.PaidByUserID = gm.UserID AND e.IsSettled = 0 THEN e.Amount ELSE 0 END), 0) AS TotalPaid,
  COALESCE(
    (
      SELECT SUM(e2.Amount) / (
        SELECT COUNT(*) FROM GroupMembers gm2 WHERE gm2.GroupID = gm.GroupID
      )
      FROM Expenses e2
      WHERE e2.GroupID = gm.GroupID AND e2.IsSettled = 0 AND e2.PaidByUserID != gm.UserID
    ), 0
  ) AS TotalOwed,
  COALESCE(SUM(CASE WHEN e.PaidByUserID = gm.UserID AND e.IsSettled = 0 THEN e.Amount ELSE 0 END), 0) -
  COALESCE(
    (
      SELECT SUM(e2.Amount) / (
        SELECT COUNT(*) FROM GroupMembers gm2 WHERE gm2.GroupID = gm.GroupID
      )
      FROM Expenses e2
      WHERE e2.GroupID = gm.GroupID AND e2.IsSettled = 0 AND e2.PaidByUserID != gm.UserID
    ), 0
  ) AS NetBalance
FROM GroupMembers gm
JOIN Users u ON gm.UserID = u.UserID
JOIN UserGroups ug ON gm.GroupID = ug.GroupID
LEFT JOIN Expenses e ON e.GroupID = gm.GroupID
GROUP BY gm.UserID, u.Name, gm.GroupID, ug.GroupName;

DELIMITER $$

CREATE TRIGGER IF NOT EXISTS after_expense_insert
AFTER INSERT ON Expenses
FOR EACH ROW
BEGIN
  INSERT INTO Notifications (UserID, Message, Type)
  SELECT gm.UserID,
    CONCAT('New expense "', NEW.Description, '" of $', NEW.Amount, ' added to your group'),
    'expense'
  FROM GroupMembers gm
  WHERE gm.GroupID = NEW.GroupID AND gm.UserID != NEW.PaidByUserID;
END$$

CREATE TRIGGER IF NOT EXISTS after_settlement_insert
AFTER INSERT ON Settlements
FOR EACH ROW
BEGIN
  INSERT INTO Notifications (UserID, Message, Type)
  VALUES (NEW.ReceiverUserID,
    CONCAT('You received a settlement payment of $', NEW.Amount),
    'settlement');
  INSERT INTO Notifications (UserID, Message, Type)
  VALUES (NEW.PayerUserID,
    CONCAT('Your settlement of $', NEW.Amount, ' has been recorded'),
    'settlement');
END$$

DELIMITER ;
