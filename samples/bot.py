import discord
from discord.ext import commands
from discord.ext.commands import CommandNotFound
import requests
import random

bot = commands.Bot(command_prefix='!', intents=discord.Intents.all())

@bot.event
async def on_ready():
    print('Logged in as AtPI#1479.')
    await bot.change_presence(activity=discord.Activity(type=discord.ActivityType.custom, name=' ', state='🌐 https://atpi.proj.sbs'))
    await bot.tree.sync()

@bot.event
async def on_command_error(ctx, error):
    if isinstance(error, CommandNotFound):
        return
    raise error

@bot.tree.command(name='welcome', description='Fetch the text from Welcome to AtPI.')
async def welcome(interaction):
    response = requests.get('https://atpi.proj.sbs/api/welcome.json')
    data = response.json()
    welcome_text = data["message"]
    await interaction.response.send_message(welcome_text)

@bot.tree.command(name='bio-question', description='Fetch a random biology question from the BioE API.')
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
                    answer_text = data["answers"].get(number)
                    if answer_text:
                        embed = discord.Embed(
                            title='BioE Answers',
                            description=f'{answer_text}',
                            colour=discord.Colour.green()
                        )
                        embed.set_image(
                            url='https://images-ext-1.discordapp.net/external/SzJ7hRJt1M3iG1kJUZ8gvjK5MzeW1bkIQFwZoGOxpss/%3Fw%3D2000/https/img.freepik.com/premium-vector/cartoon-drawing-scientist_29937-8181.jpg'
                        )
                        embed.set_footer(
                            text='https://atpi.proj.sbs/bioe.json'
                        )
                        await interaction.followup.send(embed=embed)
                    else:
                        await interaction.followup.send(f'{number} not found.', ephemeral=True)
                except Exception as e:
                    await interaction.followup.send(f'Error fetching data: {e}', ephemeral=True)
        response = requests.get(json_url)
        data = response.json()
        question_text = data["questions"].get(number)
        if question_text:
            embed = discord.Embed(
                title='BioE Questions',
                description=f'{question_text}',
                colour=discord.Colour.blue()
            )
            embed.set_image(
                url='https://t4.ftcdn.net/jpg/00/55/49/83/360_F_55498353_bK3PSjjKfXUwCcEB4SKqyCRfoFbe5gmX.jpg'
            )
            embed.set_footer(
                text='https://atpi.proj.sbs/bioe.json'
            )
            await interaction.response.send_message(embed=embed, view=BioAnswer())
        else:
            await interaction.response.send_message(f'Question No. {number} not found.', ephemeral=True)
    except Exception as e:
        await interaction.followup.send(f'Error fetching data: {e}', ephemeral=True)

@bot.tree.command(name='space-fact', description='Fetch a random space fact from the Space Fact API.')
async def space(interaction):
    api_url = 'https://atpi.proj.sbs/api/space-facts.json'
    try:
        response = requests.get(api_url)
        response.raise_for_status()
        data = response.json()
        number = str(random.randint(1, 200))
        if number in data["facts"]:
            random_fact = data["facts"][number]
            embed = discord.Embed(
                title='Space Facts',
                description=f'{random_fact}',
                colour=discord.Colour.gold()
            )
            embed.set_image(
                url='https://wallpapers.com/images/featured/dark-galaxy-wturp0ytecb3kpqq.jpg'
            )
            embed.set_footer(
                text='https://atpi.proj.sbs/space-facts.json'
            )
            await interaction.response.send_message(embed=embed)
        else:
            await interaction.response.send_message('Error: Invalid random fact number.', ephemeral=True)
    except requests.RequestException as e:
        await interaction.response.send_message(f'Error fetching space facts: {e}', ephemeral=True)

@bot.tree.command(name='country-capitals', description='Fetch the capital city of a specific country from the Countries and Capitals API.')
async def capital(interaction, country: str):
    try:
        response = requests.get('https://atpi.proj.sbs/api/world-capitals.json')
        response.raise_for_status()
        data = response.json()
        country_info = next((item for item in data if item['name'].lower() == country.lower()), None)
        if country_info:
            capital = country_info["capital"]
            embed = discord.Embed(
                title='Countries and Capitals',
                description=f'The capital of {country_info["name"]} is {capital}.',
                colour=discord.Colour.blurple()
            )
            embed.set_thumbnail(
                url=f'{country_info["image"]}'
            )
            embed.set_footer(
                text='https://atpi.proj.sbs/world-capitals.json'
            )
            await interaction.response.send_message(embed=embed)
        else:
            await interaction.response.send_message(f'Country not found in the data.', ephemeral=True)
    except requests.exceptions.RequestException as e:
        await interaction.response.send_message(f'**An error occurred while fetching data from the API**:\n{e}', ephemeral=True)

@bot.tree.command(name='physics-definition', description='Fetch the definition of a Physics term.')
async def capital(interaction, term: str):
    try:
        response = requests.get('https://atpi.proj.sbs/api/physde.json')
        data = response.json()
        physics_def = next((item for item in data if item["term"].lower() == term.lower()), None)
        if physics_def:
            data_term = physics_def["term"]
            definition = physics_def["definition"]
            embed = discord.Embed(
                title='PhysDe',
                description=f'**Term**: \n{data_term}\n\n'
                            f'**Definition**: \n{definition}',
                colour=discord.Colour.dark_red()
            )
            embed.set_image(
                url='https://i0.wp.com/www.sciencenews.org/wp-content/uploads/2023/12/120623_ec_quantum-gravity_feat.jpg'
            )
            embed.set_footer(
                text='https://atpi.proj.sbs/physde.json'
            )
            await interaction.response.send_message(embed=embed)
        else:
            await interaction.response.send_message(f'Term `\'{term}\'` not found in the data.', ephemeral=True)
    except requests.exceptions.RequestException as e:
        await interaction.response.send_message(f'**An error occurred while fetching data from the API**:\n{e}', ephemeral=True)

bot.run('TOKEN')
