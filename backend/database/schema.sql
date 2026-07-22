CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    google_id VARCHAR(255), 
    name VARCHAR(255),
    profile_pic VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP   

);


CREATE TABLE IF NOT EXISTS tasks (
  id INT NOT NULL AUTO_INCREMENT,
  user_id INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT NULL,
  location VARCHAR(255) NULL,
  priority ENUM('low','medium','high') DEFAULT 'medium',
  flag ENUM('none','family','kids','pets','work','school','health','finance') DEFAULT 'none',
  deadline DATETIME NULL,
  status ENUM('pending','in_progress','completed') DEFAULT 'pending',
  google_task_id VARCHAR(255) NULL,
  google_status ENUM('needsAction','completed') DEFAULT 'needsAction',
  google_due DATETIME NULL,
  google_updated_at DATETIME NULL,
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY user_id (user_id),
  CONSTRAINT fk_tasks_user FOREIGN KEY (user_id) REFERENCES users(id)
);
