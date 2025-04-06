import { useState, useEffect } from "react";
import { Check, Copy, Terminal } from "lucide-react";
import Prism from "prismjs";
import "prismjs/themes/prism-tomorrow.css";
import "prismjs/components/prism-python";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/app/_components/ui/dialog";
import { Button } from "@/app/_components/ui/button";
import { cn } from "@/app/_lib/utils";
import styles from "./ExportDialog.module.css";

interface ExportDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const loadingSteps = [
  "Calculating Node Branches of Workflow",
  "Checking for variable scope mismatches",
  "Preparing & Executing Plugins",
  "Fetching final results from Server",
];

export function ExportDialog({ isOpen, onClose }: ExportDialogProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [code, setCode] = useState("");
  const [isCopied, setIsCopied] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const [typedText, setTypedText] = useState("");

  // Progress and step animation
  useEffect(() => {
    if (!isLoading) return;

    // Reset states when loading starts
    setProgress(0);
    setCurrentStep(0);

    const progressPerStep = 100 / loadingSteps.length;
    const stepDuration = 2000; // 2 seconds per step
    const totalDuration = stepDuration * loadingSteps.length;
    const startTime = Date.now();

    const progressInterval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const currentStepIndex = Math.min(
        Math.floor(elapsed / stepDuration),
        loadingSteps.length - 1
      );

      setCurrentStep(currentStepIndex);
      setProgress(
        Math.min(
          (currentStepIndex +
            (elapsed >= (currentStepIndex + 1) * stepDuration ? 1 : 0)) *
            progressPerStep,
          100
        )
      );

      if (elapsed >= totalDuration) {
        clearInterval(progressInterval);
        // Wait for 1 second after "Done" before showing code
        setTimeout(() => {
          setIsLoading(false);
        }, 1000);
      }
    }, 16); // ~60fps

    return () => {
      clearInterval(progressInterval);
    };
  }, [isLoading]);

  // Typing effect for loading messages
  useEffect(() => {
    if (isLoading && currentStep < loadingSteps.length) {
      const text = loadingSteps[currentStep];
      let index = 0;

      const typingInterval = setInterval(() => {
        if (index <= text.length) {
          setTypedText(text.slice(0, index));
          index++;
        } else {
          clearInterval(typingInterval);
        }
      }, 50);

      return () => clearInterval(typingInterval);
    }
  }, [isLoading, currentStep]);

  // Highlight code when it changes
  useEffect(() => {
    if (code && !isLoading) {
      Prism.highlightAll();
    }
  }, [code, isLoading]);

  // Simulated API call - replace with actual API call
  useEffect(() => {
    if (isOpen) {
      setIsLoading(true);
      setProgress(0);
      setCurrentStep(0);
      setCode("");
      const timer = setTimeout(() => {
        setCode(`import tensorflow as tf
import numpy as np
from tensorflow.keras.layers import Dense, Dropout, BatchNormalization
from tensorflow.keras.optimizers import Adam
from tensorflow.keras.callbacks import EarlyStopping, ModelCheckpoint
import matplotlib.pyplot as plt
from sklearn.model_selection import train_test_split

class DeepNeuralNetwork:
    def __init__(self, input_shape, num_classes):
        self.input_shape = input_shape
        self.num_classes = num_classes
        self.model = self._build_model()
        
    def _build_model(self):
        """
        Builds a deep neural network with advanced architecture
        - Uses BatchNormalization for better training stability
        - Implements Dropout for regularization
        - Uses ReLU and Softmax activations
        """
        model = tf.keras.Sequential([
            # Input layer
            Dense(256, input_shape=self.input_shape, activation='relu'),
            BatchNormalization(),
            Dropout(0.3),
            
            # Hidden layers
            Dense(512, activation='relu'),
            BatchNormalization(),
            Dropout(0.4),
            
            Dense(256, activation='relu'),
            BatchNormalization(),
            Dropout(0.3),
            
            Dense(128, activation='relu'),
            BatchNormalization(),
            Dropout(0.2),
            
            # Output layer
            Dense(self.num_classes, activation='softmax')
        ])
        
        return model
    
    def compile_model(self, learning_rate=0.001):
        """
        Compiles the model with optimal parameters
        """
        optimizer = Adam(learning_rate=learning_rate)
        self.model.compile(
            optimizer=optimizer,
            loss='categorical_crossentropy',
            metrics=['accuracy']
        )
        
    def train(self, X_train, y_train, validation_split=0.2, epochs=100, batch_size=32):
        """
        Trains the model with early stopping and model checkpointing
        """
        # Create callbacks
        early_stopping = EarlyStopping(
            monitor='val_loss',
            patience=10,
            restore_best_weights=True
        )
        
        checkpoint = ModelCheckpoint(
            'best_model.h5',
            monitor='val_accuracy',
            save_best_only=True,
            mode='max'
        )
        
        # Train the model
        history = self.model.fit(
            X_train, y_train,
            validation_split=validation_split,
            epochs=epochs,
            batch_size=batch_size,
            callbacks=[early_stopping, checkpoint]
        )
        
        return history
    
    def plot_training_history(self, history):
        """
        Plots the training and validation metrics
        """
        fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(15, 5))
        
        # Plot accuracy
        ax1.plot(history.history['accuracy'], label='Training Accuracy')
        ax1.plot(history.history['val_accuracy'], label='Validation Accuracy')
        ax1.set_title('Model Accuracy')
        ax1.set_xlabel('Epoch')
        ax1.set_ylabel('Accuracy')
        ax1.legend()
        
        # Plot loss
        ax2.plot(history.history['loss'], label='Training Loss')
        ax2.plot(history.history['val_loss'], label='Validation Loss')
        ax2.set_title('Model Loss')
        ax2.set_xlabel('Epoch')
        ax2.set_ylabel('Loss')
        ax2.legend()
        
        plt.tight_layout()
        plt.show()

# Example usage
if __name__ == "__main__":
    # Generate sample data
    X = np.random.randn(1000, 20)  # 1000 samples, 20 features
    y = np.random.randint(0, 5, 1000)  # 5 classes
    y = tf.keras.utils.to_categorical(y)
    
    # Split data
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )
    
    # Create and train model
    model = DeepNeuralNetwork(input_shape=(20,), num_classes=5)
    model.compile_model()
    history = model.train(X_train, y_train)
    
    # Evaluate model
    test_loss, test_accuracy = model.model.evaluate(X_test, y_test)
    print(f"Test accuracy: {test_accuracy:.4f}")
    
    # Plot training history
    model.plot_training_history(history)`);
      }, 7500);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Terminal className="h-5 w-5 text-primary" />
            Generated Python Code
          </DialogTitle>
          <DialogDescription>
            Here&apos;s your generated Python code with a complete
            implementation of a deep neural network.
          </DialogDescription>
        </DialogHeader>
        <div className="flex-1 overflow-hidden">
          {isLoading ? (
            <div className="grid grid-rows-[1fr_auto] gap-8 min-h-[450px] rounded-lg p-8">
              {/* Top section with spinner */}
              <div className="flex items-center justify-center relative">
                <div className="flex flex-col items-center gap-16">
                  {/* Spinner */}
                  <div className="relative">
                    <div className="absolute inset-0 h-[120px] w-[120px] bg-primary/20 rounded-full animate-ping" />
                    <div className="relative h-[120px] w-[120px] rounded-full border-4 border-primary border-dashed animate-spin" />
                  </div>

                  {/* Progress bar */}
                  <div className="w-full max-w-md space-y-6">
                    <div className="h-2 w-full overflow-hidden rounded-full bg-muted-foreground/20">
                      <div
                        className="h-full bg-gradient-to-r from-primary/40 to-primary transition-all duration-500 ease-in-out"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>Progress</span>
                      <span>{Math.round(progress)}%</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom section with text and steps */}
              <div className="flex flex-col items-center gap-4">
                <div className="text-lg font-medium min-h-[28px] flex items-center justify-center">
                  <span className="inline-block min-w-0 overflow-hidden whitespace-nowrap border-r-2 border-primary animate-typing">
                    {typedText}
                  </span>
                </div>
                <div className="flex gap-2 items-center justify-center">
                  {loadingSteps.map((_, index) => (
                    <div
                      key={index}
                      className={cn(
                        "h-2 w-2 rounded-full transition-all duration-300",
                        index === currentStep
                          ? "bg-primary w-4"
                          : index < currentStep
                          ? "bg-primary/60"
                          : "bg-muted-foreground/20"
                      )}
                    />
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="relative group">
              <div className="absolute right-4 top-4 z-10 flex items-center gap-2">
                <div
                  className={cn(
                    "text-xs text-muted-foreground opacity-0 transition-opacity duration-200",
                    isCopied && "opacity-100"
                  )}
                >
                  Copied!
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={handleCopy}
                >
                  {isCopied ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <div className="relative rounded-lg border bg-[#1a1a1a] overflow-hidden">
                <div
                  className={cn(
                    "px-4 py-4 max-h-[60vh] overflow-auto",
                    styles.codeContainer
                  )}
                >
                  <pre className={cn("!bg-transparent !m-0", styles.code)}>
                    <code className="language-python">{code}</code>
                  </pre>
                </div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
