# Setting up the server

1. ## Create Python Virtual Environment

    ```bash
    python -m venv .venv
    ```

2. ## Activate Python Virtual Environment

    ```bash
    .\.venv\Scripts\activate
    ```

3. ## Install Python Libaries

    ```bash
    pip install -r .\requirements.txt
    ```

4. ## Enable CUDA
    Only run this command if you have a NVIDIA GPU

    ```bash
    pip install --upgrade torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu121
    ```

## Running notebooks

1. Run "default_settings.ipynb" notebook
2. Run "ai_training.ipynb" to train the model
3. Run "ai_testing.ipynb" to test the model
