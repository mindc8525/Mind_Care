import pandas as pd
import dash
from dash import dcc, html, Input, Output
import plotly.express as px

# 1. Load & clean
df = pd.read_csv("../public/data_trimmed.csv")
df = df.dropna(subset=[
    "gender", "ratings", "sleep_hours",
    "social_media_usage", "days_indoors", "income"
])
df["gender"] = df["gender"].str.strip().str.capitalize()
df = df[df["gender"].isin(["Male", "Female"])]

# 2. Normalize numeric columns
NUM_COLS = ["ratings", "sleep_hours", "social_media_usage", "days_indoors", "income"]
df[NUM_COLS] = (
    df[NUM_COLS] - df[NUM_COLS].min()
) / (df[NUM_COLS].max() - df[NUM_COLS].min())

# 3. Encode gender for coloring
df["gender_code"] = df["gender"].map({"Male": 0, "Female": 1})

# 4. Dash setup
app = dash.Dash(__name__)
app.title = "Parallel Coordinates"

app.layout = html.Div([

    html.H2("Demographics & Behavior — Parallel Coordinates",
            style={"textAlign": "center", "marginBottom": "30px"}),

    # Gender filter - redesigned buttons
html.Div(
        dcc.RadioItems(
            id="gender-choice",
            options=[
                {"label": "Both",   "value": "Both"},
                {"label": "Male",   "value": "Male"},
                {"label": "Female", "value": "Female"},
            ],
            value="Both",
            inputStyle={"marginRight": "8px"},
            labelStyle={
                "display": "inline-block",
                "margin": "0 15px",
                "padding": "8px 18px",
                "borderRadius": "20px",
                "border": "2px solid #ccc",
                "backgroundColor": "#b9d8e7",
                "fontWeight": "bold",
                "cursor": "pointer"
            },
            style={"textAlign": "center", "marginBottom": "20px"}
        )
    ),


    # Slider
    html.Div(
      dcc.Slider(
       id="sample-slider",
       min=0,
       max=1000,
       step=50,
       value=500,
       marks=None,
       className="custom-slider"
        ),

     style={"margin": "0 10% 40px 10%"}
    ),

    # Legend
    html.Div([
        html.Span("🔵 Male",   style={"color":"blue",  "fontWeight":"bold", "marginRight":"40px"}),
        html.Span("🔴 Female", style={"color":"red",   "fontWeight":"bold"})
    ], style={"textAlign": "center", "marginBottom": "20px"}),

    # Graph
    dcc.Graph(id="parallel-coordinates-plot")
])

@app.callback(
    Output("parallel-coordinates-plot", "figure"),
    Input("gender-choice", "value"),
    Input("sample-slider", "value")
)
def update_figure(gender_choice, sample_size):
    if gender_choice == "Male":
        dff = df[df["gender"] == "Male"]
        dff = dff.sample(n=min(sample_size, len(dff)), random_state=42)

    elif gender_choice == "Female":
        dff = df[df["gender"] == "Female"]
        dff = dff.sample(n=min(sample_size, len(dff)), random_state=42)

    else:  # "Both"
        males = df[df["gender"] == "Male"]
        females = df[df["gender"] == "Female"]
        half = sample_size // 2

        male_sample = males.sample(n=min(half, len(males)), random_state=42)
        female_sample = females.sample(n=min(half, len(females)), random_state=42)

        dff = pd.concat([male_sample, female_sample])

    # Build parallel coordinates
    fig = px.parallel_coordinates(
        dff,
        dimensions=NUM_COLS,
        color="gender_code",
        color_continuous_scale=[[0, "blue"], [1, "red"]],
        range_color=[0, 1]
    )

    fig.update_traces(opacity=0.5, selector=dict(type='scatter'))
    fig.update_layout(
        margin=dict(l=40, r=40, t=40, b=40),
        coloraxis_showscale=False
    )
    return fig

# 6. Run
if __name__ == "__main__":
    app.run(debug=True)
