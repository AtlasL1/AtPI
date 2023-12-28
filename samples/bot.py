import discord
from discord.ext import commands
import requests

bot = commands.Bot(command_prefix="!", intents=discord.Intents.all())

@bot.event
async def on_ready():
    print('Logged in as AtPI#1479.')
    await bot.tree.sync()

@bot.tree.command(name="bio-question", description="Fetch a random biology question from the BioE API.")
async def bio(interaction, number: str):
    json_url = 'https://atpi.proj.sbs/api/bioe.json'
    try:
        class BioAnswer(discord.ui.View):
            @discord.ui.button(label='Check Answer', row=0, style=discord.ButtonStyle.primary)
            async def button_callback(self, interaction: discord.Interaction, button: discord.ui.Button):
                button.disabled = True
                await interaction.response.edit_message(view=self)
                try:
                    response = requests.get(json_url)
                    data = response.json()
                    answer_text = data['answers'].get(number)
                    if answer_text:
                        embed = discord.Embed(
                            title='BioE Answers',
                            description=f'{answer_text}',
                            colour=discord.Colour.green()
                        )
                        embed.set_image(url='https://images-ext-1.discordapp.net/external/SzJ7hRJt1M3iG1kJUZ8gvjK5MzeW1bkIQFwZoGOxpss/%3Fw%3D2000/https/img.freepik.com/premium-vector/cartoon-drawing-scientist_29937-8181.jpg')
                        await interaction.followup.send(embed=embed)
                    else:
                        await interaction.followup.send(f'{number} not found.', ephemeral=True)
                except Exception as e:
                    await interaction.followup.send(f'Error fetching data: {e}', ephemeral=True)
        response = requests.get(json_url)
        data = response.json()
        question_text = data['questions'].get(number)
        if question_text:
            embed = discord.Embed(
                title='BioE Questions',
                description=f'{question_text}',
                colour=discord.Colour.blue()
            )
            embed.set_image(url='https://t4.ftcdn.net/jpg/00/55/49/83/360_F_55498353_bK3PSjjKfXUwCcEB4SKqyCRfoFbe5gmX.jpg')
            await interaction.response.send_message(embed=embed, view=BioAnswer())
        else:
            await interaction.response.send_message(f'Question No. {number} not found.', ephemeral=True)
    except Exception as e:
        await interaction.followup.send(f'Error fetching data: {e}', ephemeral=True)

bot.run('MTE4NDc4MzU4NjQ3NDMyODExNA.Go85dU.0CcsvIgeHX98NU4CFV8RXZs158jZuTFP_qOdZk')
