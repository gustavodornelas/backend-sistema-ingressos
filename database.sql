SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";

-- Banco de dados: `sistema_ingressos`

-- Estrutura para tabela `customers`
CREATE TABLE `customers` (
  `id` int NOT NULL,
  `asaas_id` varchar(20) DEFAULT NULL,
  `name` varchar(50) NOT NULL,
  `email` varchar(50) NOT NULL,
  `phone` varchar(12) DEFAULT NULL,
  `mobile_phone` varchar(12) DEFAULT NULL,
  `cpf_cnpj` varchar(15) DEFAULT NULL,
  `person_type` varchar(15) DEFAULT NULL,
  `password` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- Estrutura para tabela `customers_address`
CREATE TABLE `customers_address` (
  `id` int NOT NULL,
  `customer_id` int DEFAULT NULL,
  `name` varchar(255) NOT NULL,
  `address` varchar(255) DEFAULT NULL,
  `address_number` int DEFAULT NULL,
  `complement` varchar(255) DEFAULT NULL,
  `province` varchar(255) DEFAULT NULL,
  `city` varchar(255) DEFAULT NULL,
  `state` varchar(255) DEFAULT NULL,
  `postal_code` varchar(20) DEFAULT NULL,
  `default_address` varchar(15) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- Estrutura para tabela `events`
CREATE TABLE `events` (
  `id` int NOT NULL,
  `name` varchar(255) NOT NULL,
  `description` text,
  `venue_id` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Estrutura para tabela `events_dates`
CREATE TABLE `events_dates` (
  `id` int NOT NULL,
  `event_id` int DEFAULT NULL,
  `start_time` datetime NOT NULL,
  `end_time` datetime NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Estrutura para tabela `payments`
CREATE TABLE `payments` (
  `id` int NOT NULL,
  `customer_id` int DEFAULT NULL,
  `event_id` int DEFAULT NULL,
  `asaas_id` varchar(20) DEFAULT NULL,
  `value` float(10,2) NOT NULL,
  `billing_type` varchar(50) DEFAULT NULL,
  `transaction_date` datetime NOT NULL,
  `due_date` datetime NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `status` varchar(255) NOT NULL,
  `invoice_url` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Estrutura para tabela `refunds`
CREATE TABLE `refunds` (
  `id` int NOT NULL,
  `payment_id` int NOT NULL,
  `status` varchar(255) DEFAULT NULL,
  `value` float NOT NULL,
  `refund_date` datetime NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Estrutura para tabela `tickets`
CREATE TABLE `tickets` (
  `id` int NOT NULL,
  `batch_id` int,
  `event_id` int DEFAULT NULL,
  `eventDate_id` int DEFAULT NULL,
  `customer_id` int DEFAULT NULL,
  `payment_id` int DEFAULT NULL,
  `purchase_date` datetime DEFAULT NULL,
  `price` decimal(10,2) NOT NULL,
  `qr_code` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Estrutura para tabela `ticket_batches`
CREATE TABLE `ticket_batches` (
  `id` int NOT NULL,
  `event_id` int NOT NULL,
  `single_date_batch` varchar(5) DEFAULT NULL,
  `event_date_id` int DEFAULT NULL,
  `batch_name` varchar(50) NOT NULL,
  `quantity` int NOT NULL,
  `available_quantity` int NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `batch_date` date NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Estrutura para tabela `tokens`
CREATE TABLE `tokens` (
  `id` int NOT NULL,
  `token` varchar(255) NOT NULL,
  `customer_id` int NOT NULL,
  `login_data` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `logout_data` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Estrutura para tabela `venues`
CREATE TABLE `venues` (
  `id` int NOT NULL,
  `name` varchar(255) NOT NULL,
  `address` varchar(255) DEFAULT NULL,
  `address_number` int DEFAULT NULL,
  `complement` varchar(255) DEFAULT NULL,
  `province` varchar(255) DEFAULT NULL,
  `city` varchar(255) DEFAULT NULL,
  `state` varchar(255) DEFAULT NULL,
  `postal_code` varchar(20) DEFAULT NULL,
  `capacity` int NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Índices para tabelas despejadas

-- Índices de tabela `customers`
ALTER TABLE `customers`
  ADD PRIMARY KEY (`id`);

-- Índices de tabela `customers_address`
ALTER TABLE `customers_address`
  ADD PRIMARY KEY (`id`),
  ADD KEY `FK_customer_id2` (`customer_id`);

-- Índices de tabela `events`
ALTER TABLE `events`
  ADD PRIMARY KEY (`id`),
  ADD KEY `FK_venues_id` (`venue_id`);

-- Índices de tabela `events_dates`
ALTER TABLE `events_dates`
  ADD PRIMARY KEY (`id`),
  ADD KEY `FK_event_id` (`event_id`);

-- Índices de tabela `payments`
ALTER TABLE `payments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `event_id` (`event_id`),
  ADD KEY `customer_id` (`customer_id`);

-- Índices de tabela `refunds`
ALTER TABLE `refunds`
  ADD PRIMARY KEY (`id`);

-- Índices de tabela `tickets`
ALTER TABLE `tickets`
  ADD PRIMARY KEY (`id`),
  ADD KEY `FK_event_id2` (`event_id`),
  ADD KEY `FK_eventDate_id` (`eventDate_id`),
  ADD KEY `FK_customer_id3` (`customer_id`),
  ADD KEY `FK_payment_id1` (`payment_id`),
  ADD KEY `FK_batch_id1` (`batch_id`);

-- Índices de tabela `ticket_batches`
ALTER TABLE `ticket_batches`
  ADD PRIMARY KEY (`id`),
  ADD KEY `event_id` (`event_id`);

-- Índices de tabela `tokens`
ALTER TABLE `tokens`
  ADD PRIMARY KEY (`id`),
  ADD KEY `FK_customer_id2` (`customer_id`);

-- Índices de tabela `venues`
ALTER TABLE `venues`
  ADD PRIMARY KEY (`id`);

-- AUTO_INCREMENT para tabelas despejadas

-- AUTO_INCREMENT de tabela `customers`
ALTER TABLE `customers`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

-- AUTO_INCREMENT de tabela `customers_address`
ALTER TABLE `customers_address`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=24;

-- AUTO_INCREMENT de tabela `events`
ALTER TABLE `events`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

-- AUTO_INCREMENT de tabela `events_dates`
ALTER TABLE `events_dates`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

-- AUTO_INCREMENT de tabela `payments`
ALTER TABLE `payments`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

-- AUTO_INCREMENT de tabela `refunds`
ALTER TABLE `refunds`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

-- AUTO_INCREMENT de tabela `tickets`
ALTER TABLE `tickets`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

-- AUTO_INCREMENT de tabela `ticket_batches`
ALTER TABLE `ticket_batches`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

-- AUTO_INCREMENT de tabela `tokens`
ALTER TABLE `tokens`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

-- AUTO_INCREMENT de tabela `venues`
ALTER TABLE `venues`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

-- Restrições para tabelas despejadas

-- Restrições para tabelas `customers_address`
ALTER TABLE `customers_address`
  ADD CONSTRAINT `FK_customer_id2` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`);

-- Restrições para tabelas `events`
ALTER TABLE `events`
  ADD CONSTRAINT `FK_venues_id` FOREIGN KEY (`venue_id`) REFERENCES `venues` (`id`);

-- Restrições para tabelas `events_dates`
ALTER TABLE `events_dates`
  ADD CONSTRAINT `FK_event_id1` FOREIGN KEY (`event_id`) REFERENCES `events` (`id`);

-- Restrições para tabelas `payments`
ALTER TABLE `payments`
  ADD CONSTRAINT `FK_customer_id4` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`),
  ADD CONSTRAINT `FK_event_id3` FOREIGN KEY (`event_id`) REFERENCES `events` (`id`);

-- Restrições para tabelas `tickets`
ALTER TABLE `tickets`
  ADD CONSTRAINT `FK_customer_id3` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`),
  ADD CONSTRAINT `FK_event_id2` FOREIGN KEY (`event_id`) REFERENCES `events` (`id`),
  ADD CONSTRAINT `FK_eventDate_id` FOREIGN KEY (`eventDate_id`) REFERENCES `events_dates` (`id`),
  ADD CONSTRAINT `FK_payment_id1` FOREIGN KEY (`payment_id`) REFERENCES `payments` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  ADD CONSTRAINT `FK_batch_id1` FOREIGN KEY (`batch_id`) REFERENCES `ticket_batches` (`id`);

-- Restrições para tabelas `ticket_batches`
ALTER TABLE `ticket_batches`
  ADD CONSTRAINT `FK_event_id4` FOREIGN KEY (`event_id`) REFERENCES `events` (`id`);

-- Restrições para tabelas `tokens`
ALTER TABLE `tokens`
  ADD CONSTRAINT `FK_customer_id1` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`);
COMMIT;