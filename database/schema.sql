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
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  location VARCHAR(255),
  priority ENUM('low','medium','high') DEFAULT 'medium',
  flag ENUM('none','family','kids','pets','work','school','health','personal','shopping','finance') DEFAULT 'none',
  deadline DATETIME,
  status ENUM('pending','in_progress','completed') DEFAULT 'pending',
  google_task_id VARCHAR(255),
  google_status ENUM('needsAction','completed') DEFAULT 'needsAction',
  google_due DATETIME,
  google_updated_at DATETIME,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
CREATE TABLE EVENTS (
    ind INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,   

    title VARCHAR(255) NOT NULL,
    description TEXT,

    start_time TIME NOT NULL,
    end_time TIME NOT NULL,

    category ENUM('work', 'personal', 'kids', 'health', 'other') NOT NULL,
    priority ENUM('low', 'medium', 'high') NOT NULL default 'medium',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE

);
