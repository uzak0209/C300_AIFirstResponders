import os
import telebot

bot = telebot.TeleBot("7435088856:AAHuQW8iZ3YCMugNfZefoWT-_BBHp-cgdlI")
chat_id = 1759982324


def send_message(message: str) -> None:
    bot.send_message(chat_id, message)
